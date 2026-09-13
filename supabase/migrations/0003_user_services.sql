-- Tracks whether a user has been through the onboarding flow, so the app
-- can gate the main tabs until they've picked their services (or skipped).
alter table profiles add column onboarded boolean not null default false;

-- Tracks which paid services a user has selected during onboarding
-- (candidates for their monthly rotation). Free-tier services don't need
-- an entry here — they're always available to everyone.

create table user_services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  service_id uuid not null references services (id) on delete cascade,
  unique (user_id, service_id)
);

create index user_services_user_idx on user_services (user_id);

alter table user_services enable row level security;

create policy "user_services: user manages own" on user_services
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
