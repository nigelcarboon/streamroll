-- Let people add services the built-in list doesn't have (BritBox,
-- Kanopy, a niche anime service...). A custom service belongs to one
-- user and only that user can see it. Built-in services have no owner.

alter table public.services
  add column user_id uuid references auth.users (id) on delete cascade;

create index services_user_id_idx on public.services (user_id);

-- Built-in names stay unique; custom names are unique per person,
-- ignoring case.
alter table public.services drop constraint services_name_key;
create unique index services_builtin_name_key
  on public.services (name) where user_id is null;
create unique index services_custom_name_key
  on public.services (user_id, lower(name)) where user_id is not null;

drop policy "services: public read" on public.services;

create policy "services: read built-in and own" on public.services
  for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));

create policy "services: add own" on public.services
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "services: change own" on public.services
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "services: remove own" on public.services
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Common free Australian services that were missing.
insert into public.services (name, colour, is_free) values
  ('7plus', '#E4002B', true),
  ('9Now', '#1A9FE0', true),
  ('YouTube', '#FF0000', true);
