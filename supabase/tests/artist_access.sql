-- Run as a database administrator. All fixtures are rolled back.
begin;
create temporary table access_test_ids as select gen_random_uuid() as owner_id,gen_random_uuid() as other_id;
grant select on access_test_ids to authenticated;
insert into auth.users(id,raw_user_meta_data)
select owner_id,'{"name":"Access test owner","hometown":"Test City","mailing_address":{"street":"Private test address"}}'::jsonb from access_test_ids
union all select other_id,'{"name":"Access test other"}'::jsonb from access_test_ids;
do $$ begin
  if exists(select 1 from auth.users where id in(select owner_id from access_test_ids) and raw_user_meta_data ? 'mailing_address') then raise exception 'Address retained in metadata'; end if;
end $$;
create temporary table access_test_artist as with inserted as (insert into public.artists(name) values('Artist access test fixture') returning artist_id) select artist_id from inserted;
grant select on access_test_artist to authenticated;
select set_config('request.jwt.claims',json_build_object('sub',owner_id,'role','authenticated')::text,true) from access_test_ids;
set local role authenticated;
do $$ begin
  if (select count(*) from public.account_locations) <> 1 then raise exception 'Private address isolation failed'; end if;
  begin
    insert into public.artist_claims(user_id,artist_id,requested_name,evidence_url,identity_status,ownership_status)
      select owner_id,artist_id,'Forged claim','https://example.com','verified','approved' from access_test_ids cross join access_test_artist;
    raise exception 'Forged approval accepted';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.artist_page_designs(artist_id,bio) select artist_id,'Unauthorized bio' from access_test_artist;
    raise exception 'Unverified editing accepted';
  exception when insufficient_privilege then null; end;
end $$;
insert into public.artist_claims(user_id,artist_id,requested_name,evidence_url)
select owner_id,artist_id,'Artist access test fixture','https://example.com' from access_test_ids cross join access_test_artist;
reset role;
update public.artist_claims set identity_status='verified',ownership_status='approved' where user_id in(select owner_id from access_test_ids);
set local role authenticated;
insert into public.artist_page_designs(artist_id,bio) select artist_id,'Verified artist bio' from access_test_artist;
update public.artist_page_designs set layout='compact' where artist_id in(select artist_id from access_test_artist);
select set_config('request.jwt.claims',json_build_object('sub',other_id,'role','authenticated')::text,true) from access_test_ids;
do $$ begin
  update public.artist_page_designs set bio='Other user edit' where artist_id in(select artist_id from access_test_artist);
  if found then raise exception 'Cross-user edit accepted'; end if;
  if exists(select 1 from public.artist_claims where user_id in(select owner_id from access_test_ids)) then raise exception 'Private claim leaked'; end if;
end $$;
reset role;
do $$ begin
  if not exists(select 1 from public.artist_page_designs where artist_id in(select artist_id from access_test_artist) and bio='Verified artist bio' and layout='compact') then raise exception 'Verified save failed'; end if;
end $$;
create temporary table access_test_song as with inserted as (insert into public.songs(name) values('Supporter count test') returning song_id) select song_id from inserted;
grant select on access_test_song to authenticated;
insert into public.song_artists(song_id,artist_id) select song_id,artist_id from access_test_song cross join access_test_artist;
set local role authenticated;
insert into public.song_streams(user_id,song_id,track_key) select other_id,song_id,'song:' || song_id from access_test_ids cross join access_test_song;
insert into public.song_comments(user_id,song_id,track_key,body) select other_id,song_id,'song:' || song_id,'Test comment' from access_test_ids cross join access_test_song;
do $$ begin
  if not exists(select 1 from public.artist_supporter_counts where artist_id in(select artist_id from access_test_artist) and user_id in(select other_id from access_test_ids) and streams=1 and comments=1) then raise exception 'Supporter counts failed'; end if;
end $$;
reset role;
-- Verify artist signup captures a pending claim without granting privileges.
create temporary table access_test_signup as select gen_random_uuid() as id;
insert into auth.users(id,raw_user_meta_data) select id,jsonb_build_object('role','artist','name','Test artist applicant','artistName','Signup test artist','ownership_evidence','https://example.com','claim_artist_id',(select artist_id::text from access_test_artist)) from access_test_signup;
do $$ begin
  if not exists(select 1 from public.artist_claims where user_id in(select id from access_test_signup) and identity_status='not_started' and ownership_status='pending') then raise exception 'Signup claim not captured'; end if;
  if exists(select 1 from auth.users where id in(select id from access_test_signup) and raw_user_meta_data ? 'ownership_evidence') then raise exception 'Claim evidence retained in auth metadata'; end if;
end $$;
rollback;
