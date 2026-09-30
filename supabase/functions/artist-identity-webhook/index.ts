import Stripe from 'npm:stripe@18.5.0';
import {admin,json,stripeRequest,syncIdentity} from '../_shared/artist-access.ts';
Deno.serve(async request => {
  if (request.method !== 'POST') return json({error:'Method not allowed'},405);
  if (Deno.env.get('ARTIST_IDENTITY_ENABLED') !== 'true') return json({error:'ID verification is inactive'},503);
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secret || !key) return json({error:'Webhook is not configured'},503);
  let event;
  try {
    const stripe = new Stripe(key);
    event = await stripe.webhooks.constructEventAsync(await request.text(), request.headers.get('stripe-signature') || '',secret,undefined,Stripe.createSubtleCryptoProvider());
  } catch { return json({error:'Invalid webhook signature'},400); }
  if (!event.type.startsWith('identity.verification_session.') || !event.livemode) return json({received:true});
  try {
    // Fetch current state so retries and out-of-order events cannot restore stale approval.
    const session = await stripeRequest(`/${encodeURIComponent(event.data.object.id)}`);
    await syncIdentity(admin(),session);
    return json({received:true});
  } catch { return json({error:'Could not update verification. Retry required.'},500); }
});
