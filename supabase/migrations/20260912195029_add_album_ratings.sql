create table public.album_ratings (
  user_id uuid not null references auth.users(id) on delete cascade,
  album_key text not null check (length(album_key) > 0),
  album_id bigint references public.albums(album_id) on delete cascade,
  rating smallint not null check (rating between 0 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, album_key)
);

create index album_ratings_album_id_idx on public.album_ratings(album_id);
alter table public.album_ratings enable row level security;
create policy "Read own album ratings" on public.album_ratings for select to authenticated using (user_id = (select auth.uid()));
create policy "Create own album ratings" on public.album_ratings for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Update own album ratings" on public.album_ratings for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update on public.album_ratings to authenticated;

create table public.album_rating_totals (
  album_key text primary key,
  rating_count integer not null check (rating_count >= 0),
  rating_sum integer not null check (rating_sum >= 0)
);
alter table public.album_rating_totals enable row level security;
create policy "Read album rating totals" on public.album_rating_totals for select to authenticated using (true);
grant select on public.album_rating_totals to authenticated;

create schema if not exists private;
revoke all on schema private from public;

create function private.update_album_rating_totals() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.album_key = old.album_key then
    update public.album_rating_totals
      set rating_sum = rating_sum + new.rating - old.rating
      where album_key = new.album_key;
    return new;
  end if;

  if tg_op in ('UPDATE', 'DELETE') then
    update public.album_rating_totals
      set rating_count = rating_count - 1, rating_sum = rating_sum - old.rating
      where album_key = old.album_key;
    delete from public.album_rating_totals where album_key = old.album_key and rating_count = 0;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    insert into public.album_rating_totals (album_key, rating_count, rating_sum)
    values (new.album_key, 1, new.rating)
    on conflict (album_key) do update set
      rating_count = public.album_rating_totals.rating_count + 1,
      rating_sum = public.album_rating_totals.rating_sum + excluded.rating_sum;
    return new;
  end if;

  return old;
end;
$$;
revoke all on function private.update_album_rating_totals() from public;

create trigger album_rating_totals_changed
after insert or update or delete on public.album_ratings
for each row execute function private.update_album_rating_totals();
