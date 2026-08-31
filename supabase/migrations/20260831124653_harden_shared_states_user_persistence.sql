alter table public.shared_states enable row level security;

drop policy if exists "shared_states_select_own" on public.shared_states;
drop policy if exists "shared_states_insert_own" on public.shared_states;
drop policy if exists "shared_states_update_own" on public.shared_states;

create policy "shared_states_select_own"
on public.shared_states
for select
to authenticated
using ((select auth.uid())::text = id);

create policy "shared_states_insert_own"
on public.shared_states
for insert
to authenticated
with check ((select auth.uid())::text = id);

create policy "shared_states_update_own"
on public.shared_states
for update
to authenticated
using ((select auth.uid())::text = id)
with check ((select auth.uid())::text = id);

revoke all on table public.shared_states from anon;
revoke all on table public.shared_states from authenticated;
grant select, insert, update on table public.shared_states to authenticated;
