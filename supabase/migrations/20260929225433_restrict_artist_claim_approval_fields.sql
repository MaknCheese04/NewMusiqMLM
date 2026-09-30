revoke all on public.artist_claims from public,anon,authenticated;
grant select on public.artist_claims to authenticated;
grant insert(user_id,artist_id,requested_name,evidence_url) on public.artist_claims to authenticated;
alter policy "Request artist access" on public.artist_claims with check (
  user_id = (select auth.uid()) and identity_status = 'not_started' and ownership_status = 'pending'
  and provider_session_id is null and review_note = ''
);
