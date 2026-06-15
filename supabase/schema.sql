create table if not exists public.shared_states (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.shared_states enable row level security;

drop policy if exists "shared_states_select_anon" on public.shared_states;
drop policy if exists "shared_states_insert_anon" on public.shared_states;
drop policy if exists "shared_states_update_anon" on public.shared_states;
drop policy if exists "shared_states_select_own" on public.shared_states;
drop policy if exists "shared_states_insert_own" on public.shared_states;
drop policy if exists "shared_states_update_own" on public.shared_states;

create policy "shared_states_select_own"
on public.shared_states
for select
to authenticated
using (id = auth.uid()::text);

create policy "shared_states_insert_own"
on public.shared_states
for insert
to authenticated
with check (id = auth.uid()::text);

create policy "shared_states_update_own"
on public.shared_states
for update
to authenticated
using (id = auth.uid()::text)
with check (id = auth.uid()::text);

alter publication supabase_realtime add table public.shared_states;

create table if not exists public.user_activity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  activity_score bigint not null default 0,
  active_seconds bigint not null default 0,
  last_seen_at timestamptz not null default timezone('utc', now()),
  last_activity_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_activity_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
    or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['estereltnia@gmail.com']);
$$;

create or replace function public.record_user_activity(
  p_display_name text,
  p_email text,
  p_active_seconds bigint default 0,
  p_activity_boost bigint default 1
)
returns public.user_activity
language plpgsql
security invoker
set search_path = public
as $$
declare
  activity_row public.user_activity;
begin
  insert into public.user_activity (
    user_id,
    email,
    display_name,
    activity_score,
    active_seconds,
    last_seen_at,
    last_activity_at
  )
  values (
    auth.uid(),
    lower(coalesce(p_email, '')),
    coalesce(nullif(p_display_name, ''), split_part(lower(coalesce(p_email, '')), '@', 1), lower(coalesce(p_email, ''))),
    greatest(coalesce(p_activity_boost, 1), 1),
    greatest(coalesce(p_active_seconds, 0), 0),
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (user_id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    activity_score = public.user_activity.activity_score + greatest(coalesce(excluded.activity_score, 1), 1),
    active_seconds = public.user_activity.active_seconds + greatest(coalesce(excluded.active_seconds, 0), 0),
    last_seen_at = greatest(public.user_activity.last_seen_at, excluded.last_seen_at),
    last_activity_at = excluded.last_activity_at,
    updated_at = timezone('utc', now())
  returning * into activity_row;

  return activity_row;
end;
$$;

alter table public.user_activity enable row level security;

drop policy if exists "user_activity_select_own" on public.user_activity;
drop policy if exists "user_activity_select_admin" on public.user_activity;
drop policy if exists "user_activity_insert_own" on public.user_activity;
drop policy if exists "user_activity_update_own" on public.user_activity;

create policy "user_activity_select_own"
on public.user_activity
for select
to authenticated
using (user_id = auth.uid());

create policy "user_activity_select_admin"
on public.user_activity
for select
to authenticated
using (public.is_activity_admin());

create policy "user_activity_insert_own"
on public.user_activity
for insert
to authenticated
with check (user_id = auth.uid());

create policy "user_activity_update_own"
on public.user_activity
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

alter publication supabase_realtime add table public.user_activity;
