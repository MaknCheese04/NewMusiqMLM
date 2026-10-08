import {cors,json,signedIn} from '../_shared/artist-access.ts';
import {billingConfig,stripeClient,ensurePrice,withBillingLock,syncCustomer} from '../_shared/billing.ts';
import {BILLING_PLANS,trialEndTimestamp,isLiveBillingKey} from '../_shared/billing-plans.js';

Deno.serve(async request => {
  if(request.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  try {
    const body=await request.json();
    const config=billingConfig();
    if(body.action==='config')return json({ready:config.ready,checks:{
      secretKeyPresent:Boolean(config.key),
      liveSecretKey:isLiveBillingKey(config.key),
      webhookSecretPresent:Boolean(config.webhook),
      webhookSecretFormat:config.webhook.startsWith('whsec_'),
      httpsReturnUrl:config.appUrl.startsWith('https://'),
    }});
    if(!['refresh','portal','checkout'].includes(body.action) || (body.action==='checkout' && !Object.hasOwn(BILLING_PLANS,body.plan)))return json({error:'Choose a valid billing action and plan.'},400);
    const {user}=await signedIn(request);
    if(!config.ready)return json({error:'Live subscriptions are awaiting billing setup. No payment has been taken.'},503);
    const stripe=stripeClient();
    const result=await withBillingLock(user.id,async client=>{
      const {data:account,error}=await client.from('billing_accounts').select('*').eq('user_id',user.id).single();
      if(error)throw new Error('Could not load billing account.');
      let customerId=account.customer_id;
      if(!customerId && body.action==='refresh')return {refreshed:true};
      if(!customerId && body.action==='portal')throw new Error('Start a subscription before opening billing management.');
      if(!customerId){
        const customer=await stripe.customers.create({metadata:{user_id:user.id}}, {idempotencyKey:`newmusiq-customer-${user.id}`});
        customerId=customer.id;
        const {error:saveError}=await client.from('billing_accounts').update({customer_id:customerId}).eq('user_id',user.id);
        if(saveError)throw new Error('Could not save billing account. Please try again.');
      }
      const current=await syncCustomer(client,stripe,user.id,customerId);
      if(body.action==='refresh')return {refreshed:true};
      if(body.action==='portal'){
        const configurations=await stripe.billingPortal.configurations.list({active:true,limit:100});
        const configuration=configurations.data.find(item=>item.metadata?.app==='newmusiq-billing-v1') || await stripe.billingPortal.configurations.create({
          business_profile:{headline:'Manage your NewMusiq subscription'},metadata:{app:'newmusiq-billing-v1'},
          features:{payment_method_update:{enabled:true},invoice_history:{enabled:true},
            subscription_cancel:{enabled:true,mode:'at_period_end',proration_behavior:'none'}}
        },{idempotencyKey:'newmusiq-billing-portal-v1'});
        const portal=await stripe.billingPortal.sessions.create({customer:customerId,configuration:configuration.id,return_url:`${config.appUrl.replace(/\/$/,'')}/#billing`});
        return {url:portal.url};
      }
      if(body.action!=='checkout' || !Object.hasOwn(BILLING_PLANS,body.plan))throw new Error('Choose a valid subscription plan.');
      if(current && !['canceled','incomplete_expired'].includes(current.status))throw new Error('You already have a subscription. Use Manage billing to update it.');
      const sessions=await stripe.checkout.sessions.list({customer:customerId,status:'open',limit:100});
      for(const session of sessions.data){
        if(session.mode!=='subscription' || session.metadata?.user_id!==user.id)continue;
        if(session.metadata.plan===body.plan && session.url)return {url:session.url};
        await stripe.checkout.sessions.expire(session.id);
      }
      const price=await ensurePrice(stripe,body.plan);
      const {data:fresh,error:freshError}=await client.from('billing_accounts').select('trial_used').eq('user_id',user.id).single();
      if(freshError)throw new Error('Could not check trial eligibility.');
      const plan=BILLING_PLANS[body.plan];
      const base=config.appUrl.replace(/\/$/,'');
      const checkout=await stripe.checkout.sessions.create({mode:'subscription',customer:customerId,
        line_items:[{price:price.id,quantity:1}],payment_method_collection:'always',
        success_url:`${base}/#billing`,cancel_url:`${base}/#billing`,expires_at:Math.floor(Date.now()/1000)+1800,
        client_reference_id:user.id,metadata:{user_id:user.id,plan:body.plan},
        subscription_data:{metadata:{user_id:user.id},...(!fresh.trial_used ? {trial_end:trialEndTimestamp(Date.now(),plan.trialMonths)} : {})},
        custom_text:{submit:{message:fresh.trial_used ? `$${plan.cents/100} USD per month. Cancel anytime in Manage billing.` : `${plan.trialMonths} calendar month${plan.trialMonths===1?'':'s'} free, then $${plan.cents/100} USD per month. Cancel before the trial ends to avoid charges.`}}
      });
      return {url:checkout.url};
    });
    return json(result);
  }catch(error){return json({error:error instanceof Error ? error.message : 'Billing is unavailable. Please try again.'},400);}
});
