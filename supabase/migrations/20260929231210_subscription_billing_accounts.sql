create table public.billing_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  customer_id text unique,
  subscription_id text unique,
  plan text check(plan in ('listener','artist')),
  status text not null default 'none',
  trial_used boolean not null default false,
  trial_end timestamptz,
  period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  lock_token uuid,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.billing_accounts enable row level security;
revoke all on public.billing_accounts from public,anon,authenticated;
grant select(user_id,plan,status,trial_used,trial_end,period_end,cancel_at_period_end,updated_at) on public.billing_accounts to authenticated;
grant all on public.billing_accounts to service_role;
create policy "Read own subscription" on public.billing_accounts for select to authenticated using (user_id=(select auth.uid()));

create function public.lock_billing_account(account_id uuid,token uuid) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
  insert into public.billing_accounts(user_id) values(account_id) on conflict do nothing;
  update public.billing_accounts set lock_token=token,locked_until=now()+interval '3 minutes'
    where user_id=account_id and (locked_until is null or locked_until < now());
  return found;
end;
$$;
revoke all on function public.lock_billing_account(uuid,uuid) from public,anon,authenticated;
grant execute on function public.lock_billing_account(uuid,uuid) to service_role;

create function public.release_billing_account(account_id uuid,token uuid) returns void
language sql security invoker set search_path='' as $$
  update public.billing_accounts set lock_token=null,locked_until=null where user_id=account_id and lock_token=token;
$$;
revoke all on function public.release_billing_account(uuid,uuid) from public,anon,authenticated;
grant execute on function public.release_billing_account(uuid,uuid) to service_role;
