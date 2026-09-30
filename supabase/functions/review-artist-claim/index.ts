import {cors,json,signedIn} from '../_shared/artist-access.ts';
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok',{headers:cors});
  if (request.method !== 'POST') return json({error:'Method not allowed'},405);
  try {
    const {client,user} = await signedIn(request);
    if (user.app_metadata?.artist_reviewer !== true) return json({error:'Reviewer access required.'},403);
    const {claimId,approve,note} = await request.json();
    if (typeof approve !== 'boolean' || typeof note !== 'string' || note.length > 2000) return json({error:'Invalid review.'},400);
    const {error} = await client.rpc('review_artist_claim',{claim:claimId,approved:approve,note});
    if (error) return json({error:'Review could not be saved. Confirm ID verification is complete and refresh the request.'},400);
    return json({saved:true});
  } catch { return json({error:'Unable to review this request.'},400); }
});
