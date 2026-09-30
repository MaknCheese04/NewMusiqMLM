import Stripe from 'npm:stripe@18.5.0';
import { admin } from './artist-access.ts';
import { BILLING_PLANS, matchesPlan } from './billing-plans.js';

export function billingConfig() {
  const key = Deno.env.get('STRIPE_BILLING_SECRET_KEY') || '';
  const appUrl = Deno.env.get('BILLING_APP_URL') || '';
  const webhook = Deno.env.get('STRIPE_BILLING_WEBHOOK_SECRET') || '';
  return {key,appUrl,webhook,ready:key.startsWith('sk_live_') && appUrl.startsWith('https://') && Boolean(webhook)};
}
export function stripeClient() {
  const {key} = billingConfig();
  if (!key.startsWith('sk_live_')) throw new Error('Live billing is awaiting Stripe configuration.');
  return new Stripe(key,{timeout:10000,maxNetworkRetries:1});
}
export async function ensurePrice(stripe: Stripe, planKey: string) {
  const plan = BILLING_PLANS[planKey];
  if (!plan) throw new Error('Invalid plan.');
  const prices = await stripe.prices.list({lookup_keys:[plan.lookup],active:true,limit:1});
  const price = prices.data[0] || await stripe.prices.create({currency:'usd',unit_amount:plan.cents,
    recurring:{interval:'month'},lookup_key:plan.lookup,product_data:{name:`NewMusiq ${plan.name}`}},
    {idempotencyKey:`price-${plan.lookup}`});
  if (!price.livemode || !matchesPlan(price,plan)) throw new Error('Subscription price configuration does not match the advertised plan.');
  return price;
}
export async function withBillingLock(userId: string, work: (client: ReturnType<typeof admin>) => Promise<unknown>) {
  const client = admin(); const token = crypto.randomUUID();
  const {data,error} = await client.rpc('lock_billing_account',{account_id:userId,token});
  if (error || !data) throw new Error('Billing is already updating. Please try again shortly.');
  try { return await work(client); }
  finally { await client.rpc('release_billing_account',{account_id:userId,token}); }
}
export async function syncCustomer(client: ReturnType<typeof admin>, stripe: Stripe, userId: string, customerId: string) {
  // Retrieve latest provider state on each sync; never trust a checkout redirect or stale event payload.
  const subscriptions = await stripe.subscriptions.list({customer:customerId,status:'all',limit:100});
  const known = subscriptions.data.filter(sub => sub.livemode && sub.metadata.user_id === userId
    && sub.items.data.length === 1 && Object.values(BILLING_PLANS).some(plan => {
      const price=sub.items.data[0]?.price;
      return price?.lookup_key === plan.lookup && price.unit_amount === plan.cents && price.currency === 'usd'
        && price.recurring?.interval === 'month' && price.recurring.interval_count === 1;
    }));
  const current = known.find(sub => !['canceled','incomplete_expired'].includes(sub.status)) || known.sort((a,b)=>b.created-a.created)[0];
  if (current) {
    const plan = Object.entries(BILLING_PLANS).find(([,plan])=>current.items.data[0].price.lookup_key === plan.lookup)![0];
    const timestamp = (seconds?: number | null) => seconds ? new Date(seconds*1000).toISOString() : null;
    const {error} = await client.from('billing_accounts').update({subscription_id:current.id,plan,status:current.status,
      trial_end:timestamp(current.trial_end),period_end:timestamp(current.items.data[0]?.current_period_end),
      cancel_at_period_end:current.cancel_at_period_end,
      ...(known.some(sub=>sub.trial_start !== null) ? {trial_used:true} : {}),updated_at:new Date().toISOString()
    }).eq('user_id',userId).eq('customer_id',customerId);
    if(error) throw new Error('Could not synchronize your subscription.');
  }
  return current;
}
