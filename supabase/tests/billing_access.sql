begin;
create temporary table billing_test_users as select gen_random_uuid() as owner_id,gen_random_uuid() as other_id;
grant select on billing_test_users to authenticated;
insert into auth.users(id,raw_user_meta_data) select owner_id,'{"name":"Billing test owner"}'::jsonb from billing_test_users
union all select other_id,'{"name":"Billing test other"}'::jsonb from billing_test_users;
insert into public.billing_accounts(user_id,plan,status) select owner_id,'listener','trialing' from billing_test_users
union all select other_id,'artist','active' from billing_test_users;
select set_config('request.jwt.claims',json_build_object('sub',owner_id,'role','authenticated')::text,true) from billing_test_users;
set local role authenticated;
do $$ begin
  if (select count(user_id) from public.billing_accounts) <> 1 then raise exception 'Cross-user billing data visible'; end if;
  begin
    update public.billing_accounts set status='active'; raise exception 'Client changed payment status';
  exception when insufficient_privilege then null; end;
  begin
    perform customer_id from public.billing_accounts; raise exception 'Private provider IDs visible';
  exception when insufficient_privilege then null; end;
  begin
    perform public.lock_billing_account((select owner_id from billing_test_users),gen_random_uuid()); raise exception 'Client accessed billing lock';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ declare uid uuid := (select owner_id from billing_test_users); first_token uuid:=gen_random_uuid(); begin
  if not public.lock_billing_account(uid,first_token) then raise exception 'Could not acquire billing lock'; end if;
  if public.lock_billing_account(uid,gen_random_uuid()) then raise exception 'Concurrent billing request accepted'; end if;
  perform public.release_billing_account(uid,gen_random_uuid());
  if public.lock_billing_account(uid,gen_random_uuid()) then raise exception 'Wrong token released billing lock'; end if;
  perform public.release_billing_account(uid,first_token);
  if not public.lock_billing_account(uid,gen_random_uuid()) then raise exception 'Correct token did not release lock'; end if;
end $$;
rollback;
