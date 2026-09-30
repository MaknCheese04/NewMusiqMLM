import Stripe from 'npm:stripe@18.5.0';
import {admin,json} from '../_shared/artist-access.ts';
import {billingConfig,stripeClient,withBillingLock,syncCustomer} from '../_shared/billing.ts';
Deno.serve(async request=>{
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const config=billingConfig();
  if(!config.ready)return json({error:'Billing is not configured'},503);
  const stripe=stripeClient(); let event;
  try{event=await stripe.webhooks.constructEventAsync(await request.text(),request.headers.get('stripe-signature') || '',config.webhook,undefined,Stripe.createSubtleCryptoProvider());}
  catch{return json({error:'Invalid signature'},400);}
  if(!event.livemode)return json({received:true});
  if(!['checkout.session.completed','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','invoice.paid','invoice.payment_failed'].includes(event.type))return json({received:true});
  const object=event.data.object as {customer?:string | {id:string}};
  const customerId=typeof object.customer==='string' ? object.customer : object.customer?.id;
  if(!customerId)return json({received:true});
  try{
    const client=admin();
    const {data,error}=await client.from('billing_accounts').select('user_id').eq('customer_id',customerId).maybeSingle();
    if(error)throw error;
    if(!data)return json({received:true});
    await withBillingLock(data.user_id,db=>syncCustomer(db,stripe,data.user_id,customerId));
    return json({received:true});
  }catch{return json({error:'Synchronization failed; retry required'},500);}
});
