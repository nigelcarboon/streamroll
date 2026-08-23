-- StreamRoll initial schema
-- Tables: profiles, services, roster_slots, watchlist_items, reminder_log

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  region text not null default 'AU',
  created_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  colour text not null,
  is_free boolean not null default false
);

create table roster_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  service_id uuid not null references services (id) on delete cascade,
  month smallint not null check (month between 1 and 12),
  year smallint not null check (year >= 2020),
  unique (user_id, month, year)
);

create table watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  tmdb_id integer,
  matched_service_id uuid references services (id) on delete set null,
  status text not null default 'unwatched' check (status in ('unwatched', 'watched')),
  source text not null default 'manual' check (source in ('manual', 'paste')),
  added_at timestamptz not null default now()
);

create table reminder_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  service_id uuid not null references services (id) on delete cascade,
  sent_at timestamptz not null default now()
);

create index roster_slots_user_idx on roster_slots (user_id);
create index watchlist_items_user_idx on watchlist_items (user_id);
create index reminder_log_user_idx on reminder_log (user_id);

-- Row Level Security: every table is scoped to the owning user,
-- except `services`, which is shared reference data (public read only).

alter table profiles enable row level security;
alter table services enable row level security;
alter table roster_slots enable row level security;
alter table watchlist_items enable row level security;
alter table reminder_log enable row level security;

create policy "profiles: user reads own" on profiles
  for select using (auth.uid() = id);
create policy "profiles: user updates own" on profiles
  for update using (auth.uid() = id);
create policy "profiles: user inserts own" on profiles
  for insert with check (auth.uid() = id);

create policy "services: public read" on services
  for select using (true);

create policy "roster_slots: user manages own" on roster_slots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "watchlist_items: user manages own" on watchlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reminder_log: user reads own" on reminder_log
  for select using (auth.uid() = user_id);

-- New auth users automatically get a profile row.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
