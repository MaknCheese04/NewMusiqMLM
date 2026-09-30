import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
export const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status, headers: {...cors,'Content-Type':'application/json'}});
export const admin = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {auth:{persistSession:false,autoRefreshToken:false}});
export async function signedIn(request: Request) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i,'');
  if (!token) throw new Error('Sign in to continue.');
  const client = admin();
  const {data,error} = await client.auth.getUser(token);
  if (error || !data.user) throw new Error('Sign in to continue.');
  return {client,user:data.user};
}
export async function stripeRequest(path: string, body?: URLSearchParams, idempotencyKey?: string) {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) throw new Error('ID verification is not configured yet. Please contact NewMusiq support.');
  const response = await fetch(`https://api.stripe.com/v1/identity/verification_sessions${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {Authorization:`Bearer ${key}`, ...(body ? {'Content-Type':'application/x-www-form-urlencoded'} : {}), ...(idempotencyKey ? {'Idempotency-Key':idempotencyKey} : {})}, body,
  });
  if (!response.ok) throw new Error('The ID verification service is unavailable. Please try again.');
  return response.json();
}
export async function syncIdentity(client: ReturnType<typeof admin>, session: any) {
  const claimId = session.metadata?.claim_id;
  if (!claimId || !session.livemode) return;
  const identity_status = ['requires_input','processing','verified','canceled'].includes(session.status) ? session.status : 'requires_input';
  const {error} = await client.from('artist_claims').update({identity_status,
    ...(identity_status !== 'verified' ? {ownership_status:'pending'} : {})
  }).eq('claim_id',claimId).eq('user_id',session.metadata.user_id).eq('provider_session_id',session.id);
  if (error) throw new Error('Could not update verification status.');
}
