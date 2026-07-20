create or replace function public.is_activity_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
    or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['estereltnia@gmail.com']);
$$;

drop policy if exists "user_activity_select_own" on public.user_activity;
drop policy if exists "user_activity_select_admin" on public.user_activity;

create policy "user_activity_select_visible"
on public.user_activity
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or (select public.is_activity_admin())
);
