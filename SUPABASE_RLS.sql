-- Enable Row Level Security (RLS) and restrict all data to the signed-in user.
-- Assumes your tables have a `user_id text not null` column (as in DEPLOYMENT.md).
-- Policies compare against `auth.uid()::text`.

alter table public.habits enable row level security;
alter table public.tracking enable row level security;
alter table public.calendar_activities enable row level security;
alter table public.missed_notes enable row level security;
alter table public.sleep_log enable row level security;

-- HABITS
create policy "habits_select_own"
on public.habits for select
using (user_id = auth.uid()::text);

create policy "habits_insert_own"
on public.habits for insert
with check (user_id = auth.uid()::text);

create policy "habits_update_own"
on public.habits for update
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

create policy "habits_delete_own"
on public.habits for delete
using (user_id = auth.uid()::text);

-- TRACKING
create policy "tracking_select_own"
on public.tracking for select
using (user_id = auth.uid()::text);

create policy "tracking_insert_own"
on public.tracking for insert
with check (user_id = auth.uid()::text);

create policy "tracking_update_own"
on public.tracking for update
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

create policy "tracking_delete_own"
on public.tracking for delete
using (user_id = auth.uid()::text);

-- CALENDAR
create policy "calendar_select_own"
on public.calendar_activities for select
using (user_id = auth.uid()::text);

create policy "calendar_insert_own"
on public.calendar_activities for insert
with check (user_id = auth.uid()::text);

create policy "calendar_update_own"
on public.calendar_activities for update
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

create policy "calendar_delete_own"
on public.calendar_activities for delete
using (user_id = auth.uid()::text);

-- MISSED NOTES
create policy "missed_notes_select_own"
on public.missed_notes for select
using (user_id = auth.uid()::text);

create policy "missed_notes_insert_own"
on public.missed_notes for insert
with check (user_id = auth.uid()::text);

create policy "missed_notes_update_own"
on public.missed_notes for update
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

create policy "missed_notes_delete_own"
on public.missed_notes for delete
using (user_id = auth.uid()::text);

-- SLEEP LOG
create policy "sleep_log_select_own"
on public.sleep_log for select
using (user_id = auth.uid()::text);

create policy "sleep_log_insert_own"
on public.sleep_log for insert
with check (user_id = auth.uid()::text);

create policy "sleep_log_update_own"
on public.sleep_log for update
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

create policy "sleep_log_delete_own"
on public.sleep_log for delete
using (user_id = auth.uid()::text);

