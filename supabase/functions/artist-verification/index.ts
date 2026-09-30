import {cors,json,signedIn,stripeRequest,syncIdentity} from '../_shared/artist-access.ts';
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok',{headers:cors});
  if (request.method !== 'POST') return json({error:'Method not allowed'},405);
  if (Deno.env.get('ARTIST_IDENTITY_ENABLED') !== 'true') return json({error:'ID verification is not active yet. Your artist access request can remain pending.'},503);
  try {
    const {client,user} = await signedIn(request);
    const {claimId,action} = await request.json();
    const {data:claim,error} = await client.from('artist_claims').select('*').eq('claim_id',claimId).eq('user_id',user.id).single();
    if (error || !claim) return json({error:'Artist access request not found.'},404);
    if (claim.provider_session_id) {
      const existing = await stripeRequest(`/${encodeURIComponent(claim.provider_session_id)}`);
      await syncIdentity(client,existing);
      if (action === 'refresh' || existing.status !== 'canceled') return json({url:existing.url || null,status:existing.status, testMode:!existing.livemode});
    }
    if (action === 'refresh') return json({status:claim.identity_status});
    const siteUrl = Deno.env.get('APP_URL');
    if (!siteUrl || !siteUrl.startsWith('https://')) return json({error:'ID verification needs the application return URL configured.'},503);
    const body = new URLSearchParams({type:'document',return_url:siteUrl,
      'metadata[claim_id]':claim.claim_id,'metadata[user_id]':user.id,
      'options[document][require_matching_selfie]':'true'});
    const session = await stripeRequest('',body,`artist-claim-${claim.claim_id}-${claim.provider_session_id || 'first'}`);
    const {error:saveError} = await client.from('artist_claims').update({provider_session_id:session.id,identity_status:'requires_input'}).eq('claim_id',claim.claim_id);
    if (saveError) throw new Error('Could not start ID verification. Please try again.');
    return json({url:session.url,testMode:!session.livemode});
  } catch(error) { return json({error:error.message || 'Verification unavailable.'},400); }
});
