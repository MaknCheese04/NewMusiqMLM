-- Private onboarding data and independently reviewed artist claims.
create table public.account_locations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  hometown text not null default '' check (length(hometown) <= 200),
  mailing_address jsonb not null default '{}' check (jsonb_typeof(mailing_address) = 'object')
);
alter table public.account_locations enable row level security;
create policy "Own location" on public.account_locations for select to authenticated using (user_id = (select auth.uid()));
create policy "Update own location" on public.account_locations for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, update on public.account_locations to authenticated;

create table public.listener_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 80)
);
alter table public.listener_profiles enable row level security;
create policy "Read listener names" on public.listener_profiles for select to authenticated using (true);
grant select on public.listener_profiles to authenticated;

create table public.artist_claims (
  claim_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_id bigint references public.artists(artist_id),
  requested_name text not null check (length(trim(requested_name)) between 1 and 100),
  evidence_url text not null check (evidence_url ~ '^https://[^[:space:]]+$' and length(evidence_url) <= 1000),
  identity_status text not null default 'not_started' check (identity_status in ('not_started','requires_input','processing','verified','canceled')),
  ownership_status text not null default 'pending' check (ownership_status in ('pending','approved','rejected')),
  provider_session_id text unique,
  review_note text not null default '',
  created_at timestamptz not null default now(),
  unique(user_id, requested_name),
  check (ownership_status <> 'approved' or (identity_status = 'verified' and artist_id is not null))
);
create index artist_claims_artist_idx on public.artist_claims(artist_id);
alter table public.artist_claims enable row level security;
create policy "Read own artist claims" on public.artist_claims for select to authenticated
  using (user_id = (select auth.uid()) or (select auth.jwt()->'app_metadata'->>'artist_reviewer') = 'true');
create policy "Request artist access" on public.artist_claims for insert to authenticated with check (user_id = (select auth.uid()));
grant select on public.artist_claims to authenticated;
grant insert(user_id,artist_id,requested_name,evidence_url) on public.artist_claims to authenticated;

create table public.artist_page_designs (
  artist_id bigint primary key references public.artists(artist_id) on delete cascade,
  bio text not null check (length(trim(bio)) between 1 and 5000),
  hometown text not null default '' check (length(hometown) <= 200),
  tagline text not null default '' check (length(tagline) <= 200),
  portrait_url text not null default '' check (portrait_url = '' or portrait_url ~ '^https://[^[:space:]]+$'),
  artwork_url text not null default '' check (artwork_url = '' or artwork_url ~ '^https://[^[:space:]]+$'),
  accent_color text not null default '#7561a9' check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  layout text not null default 'classic' check (layout in ('classic','compact','spotlight')),
  extra_sections jsonb not null default '[]' check (jsonb_typeof(extra_sections) = 'array' and jsonb_array_length(extra_sections) <= 12 and octet_length(extra_sections::text) <= 40000)
);
alter table public.artist_page_designs enable row level security;
create policy "Read artist designs" on public.artist_page_designs for select to anon, authenticated using (true);
create policy "Verified artist creates design" on public.artist_page_designs for insert to authenticated with check (
  exists (select 1 from public.artist_claims c where c.artist_id = artist_page_designs.artist_id and c.user_id = (select auth.uid()) and c.identity_status = 'verified' and c.ownership_status = 'approved'));
create policy "Verified artist edits design" on public.artist_page_designs for update to authenticated using (
  exists (select 1 from public.artist_claims c where c.artist_id = artist_page_designs.artist_id and c.user_id = (select auth.uid()) and c.identity_status = 'verified' and c.ownership_status = 'approved')) with check (
  exists (select 1 from public.artist_claims c where c.artist_id = artist_page_designs.artist_id and c.user_id = (select auth.uid()) and c.identity_status = 'verified' and c.ownership_status = 'approved'));
grant select on public.artist_page_designs to anon, authenticated;
grant insert, update on public.artist_page_designs to authenticated;

-- Trigger runs only for signup; no client can call it or approve a claim.
create function private.capture_artist_onboarding() returns trigger
language plpgsql security definer set search_path = '' as $$
declare m jsonb := new.raw_user_meta_data; requested_id bigint;
begin
  insert into public.account_locations(user_id,hometown,mailing_address)
    values(new.id,left(coalesce(m->>'hometown',''),200),coalesce(m->'mailing_address','{}'::jsonb));
  insert into public.listener_profiles(user_id,display_name)
    values(new.id,left(coalesce(nullif(trim(m->>'name'),''),'Listener'),80));
  if m->>'role' = 'artist' then
    requested_id := nullif(m->>'claim_artist_id','')::bigint;
    insert into public.artist_claims(user_id,artist_id,requested_name,evidence_url)
      values(new.id,requested_id,coalesce(nullif(trim(m->>'artistName'),''),m->>'name'),m->>'ownership_evidence');
  end if;
  -- Remove the private address from auth metadata before tokens are issued.
  update auth.users set raw_user_meta_data = raw_user_meta_data - 'mailing_address' - 'ownership_evidence' where id = new.id;
  return new;
end;
$$;
revoke all on function private.capture_artist_onboarding() from public, anon, authenticated;
create trigger capture_artist_onboarding after insert on auth.users for each row execute function private.capture_artist_onboarding();

insert into public.listener_profiles(user_id,display_name)
select id,left(coalesce(nullif(trim(raw_user_meta_data->>'name'),''),'Listener'),80) from auth.users on conflict do nothing;
insert into public.account_locations(user_id) select id from auth.users on conflict do nothing;

-- Public aggregate counts, without exposing listening history or addresses.
create table public.artist_supporter_counts (
  artist_id bigint not null references public.artists(artist_id) on delete cascade,
  user_id uuid not null references public.listener_profiles(user_id) on delete cascade,
  streams bigint not null default 0 check(streams >= 0),
  comments bigint not null default 0 check(comments >= 0),
  primary key(artist_id,user_id)
);
create index artist_supporter_user_idx on public.artist_supporter_counts(user_id);
create index artist_supporter_streams_idx on public.artist_supporter_counts(artist_id,streams desc);
create index artist_supporter_comments_idx on public.artist_supporter_counts(artist_id,comments desc);
alter table public.artist_supporter_counts enable row level security;
create policy "Read artist supporter counts" on public.artist_supporter_counts for select to authenticated using (true);
grant select on public.artist_supporter_counts to authenticated;
create function private.count_artist_supporter() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.user_id is null or new.song_id is null then return new; end if;
  insert into public.artist_supporter_counts(artist_id,user_id,streams,comments)
    select distinct sa.artist_id,new.user_id,case when tg_table_name = 'song_streams' then 1 else 0 end,
      case when tg_table_name = 'song_comments' then 1 else 0 end
    from public.song_artists sa where sa.song_id = new.song_id
    on conflict(artist_id,user_id) do update set streams = public.artist_supporter_counts.streams + excluded.streams,
      comments = public.artist_supporter_counts.comments + excluded.comments;
  return new;
end;
$$;
revoke all on function private.count_artist_supporter() from public, anon, authenticated;
create trigger count_artist_listener after insert on public.song_streams for each row execute function private.count_artist_supporter();
create trigger count_artist_commenter after insert on public.song_comments for each row execute function private.count_artist_supporter();
insert into public.artist_supporter_counts(artist_id,user_id,streams,comments)
select artist_id,user_id,sum(streams),sum(comments) from (
 select sa.artist_id,s.user_id,count(*) as streams,0::bigint as comments from public.song_streams s
 join (select distinct song_id,artist_id from public.song_artists) sa on sa.song_id = s.song_id where s.user_id is not null group by sa.artist_id,s.user_id
 union all
 select sa.artist_id,c.user_id,0::bigint,count(*) from public.song_comments c
 join (select distinct song_id,artist_id from public.song_artists) sa on sa.song_id = c.song_id group by sa.artist_id,c.user_id
) counts group by artist_id,user_id;
grant all on public.account_locations,public.listener_profiles,public.artist_claims,public.artist_page_designs,public.artist_supporter_counts to service_role;

create function public.review_artist_claim(claim uuid,approved boolean,note text) returns void
language plpgsql security invoker set search_path = '' as $$
declare c public.artist_claims; target_id bigint;
begin
  select * into strict c from public.artist_claims where claim_id = claim for update;
  if c.ownership_status <> 'pending' then raise exception 'Request already reviewed'; end if;
  if approved and c.identity_status <> 'verified' then raise exception 'Identity verification required'; end if;
  target_id := c.artist_id;
  if approved and target_id is null then
    insert into public.artists(name) values(c.requested_name) returning artist_id into target_id;
  end if;
  update public.artist_claims set artist_id = target_id,ownership_status = case when approved then 'approved' else 'rejected' end,
    review_note = left(note,2000) where claim_id = claim;
end;
$$;
revoke all on function public.review_artist_claim(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.review_artist_claim(uuid,boolean,text) to service_role;
