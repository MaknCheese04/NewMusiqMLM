create or replace function private.capture_artist_onboarding() returns trigger
language plpgsql security definer set search_path = '' as $$
declare m jsonb := new.raw_user_meta_data; requested_id bigint;
begin
  insert into public.account_locations(user_id,hometown,mailing_address)
    values(new.id,left(coalesce(m->>'hometown',''),200),coalesce(m->'mailing_address','{}'::jsonb));
  insert into public.listener_profiles(user_id,display_name)
    values(new.id,left(coalesce(nullif(trim(m->>'name'),''),'Listener'),80));
  -- Older clients can still register; they submit their claim in Artist access.
  if m->>'role' = 'artist' and coalesce(m->>'ownership_evidence','') ~ '^https://[^[:space:]]+$' then
    requested_id := nullif(m->>'claim_artist_id','')::bigint;
    insert into public.artist_claims(user_id,artist_id,requested_name,evidence_url)
      values(new.id,requested_id,coalesce(nullif(trim(m->>'artistName'),''),m->>'name'),m->>'ownership_evidence');
  end if;
  update auth.users set raw_user_meta_data = raw_user_meta_data - 'mailing_address' - 'ownership_evidence' where id = new.id;
  return new;
end;
$$;
revoke all on function private.capture_artist_onboarding() from public,anon,authenticated;
