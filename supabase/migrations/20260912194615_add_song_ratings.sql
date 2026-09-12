create table public.song_ratings (
  user_id uuid not null references auth.users(id) on delete cascade,
  track_key text not null,
  song_id bigint references public.songs(song_id) on delete cascade,
  rating smallint not null check (rating between 0 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, track_key)
);

create index song_ratings_song_id_idx on public.song_ratings(song_id);

alter table public.song_ratings enable row level security;

create policy "Read own song ratings" on public.song_ratings
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Create own song ratings" on public.song_ratings
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Update own song ratings" on public.song_ratings
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.song_ratings to authenticated;
