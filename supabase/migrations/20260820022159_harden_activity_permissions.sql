create or replace function public.record_user_activity(
  p_display_name text,
  p_email text,
  p_active_seconds bigint default 0,
  p_activity_boost bigint default 1
)
returns public.user_activity
language plpgsql
security definer
set search_path = public
as $$
declare
  activity_row public.user_activity;
  clean_active_seconds bigint := least(greatest(coalesce(p_active_seconds, 0), 0), 300);
  clean_activity_boost bigint := least(greatest(coalesce(p_activity_boost, 1), 1), 5);
  clean_email text := lower(coalesce(auth.jwt() ->> 'email', p_email, ''));
  clean_display_name text := left(
    coalesce(
      nullif(trim(p_display_name), ''),
      split_part(lower(coalesce(auth.jwt() ->> 'email', p_email, '')), '@', 1),
      lower(coalesce(auth.jwt() ->> 'email', p_email, ''))
    ),
    100
  );
begin
  if auth.uid() is null then
    raise insufficient_privilege using message = 'Authentication required.';
  end if;

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
    clean_email,
    clean_display_name,
    clean_activity_boost,
    clean_active_seconds,
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (user_id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    activity_score = public.user_activity.activity_score + excluded.activity_score,
    active_seconds = public.user_activity.active_seconds + excluded.active_seconds,
    last_seen_at = greatest(public.user_activity.last_seen_at, excluded.last_seen_at),
    last_activity_at = excluded.last_activity_at,
    updated_at = timezone('utc', now())
  returning * into activity_row;

  return activity_row;
end;
$$;

revoke all on table public.shared_states from anon;
revoke all on table public.user_activity from anon;
revoke insert, update, delete on table public.user_activity from authenticated;
grant usage on schema public to authenticated;
grant select, insert, update on table public.shared_states to authenticated;
grant select on table public.user_activity to authenticated;

revoke all on function public.record_user_activity(text, text, bigint, bigint) from public;
revoke all on function public.record_user_activity(text, text, bigint, bigint) from anon;
grant execute on function public.record_user_activity(text, text, bigint, bigint) to authenticated;

revoke all on function public.is_activity_admin() from public;
revoke all on function public.is_activity_admin() from anon;
grant execute on function public.is_activity_admin() to authenticated;
