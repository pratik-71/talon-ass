-- ============================================================
-- Digital Heroes / Talon Platform — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. USER PROFILES (extended from Supabase Auth)
create table if not exists public.user_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  charity_id   uuid references public.charities(id),
  donation_percentage integer not null default 10 check (donation_percentage between 10 and 100),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, full_name, charity_id, donation_percentage)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'charity_id')::uuid,
    coalesce((new.raw_user_meta_data->>'donation_percentage')::integer, 10)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. CHARITIES
create table if not exists public.charities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  logo_url    text,
  website_url text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 3. SUBSCRIPTIONS (synced via Paddle webhook)
create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  paddle_subscription_id   text unique,
  paddle_customer_id       text,
  status                   text not null default 'inactive',
  plan_id                  text,
  current_period_end       timestamptz,
  updated_at               timestamptz not null default now(),
  created_at               timestamptz not null default now()
);

-- 4. SCORES (max 5 per user, rolling — enforced in API)
create table if not exists public.scores (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  score      integer not null check (score between 1 and 45),
  date       date not null,
  created_at timestamptz not null default now(),
  -- No duplicate dates per user
  unique (user_id, date)
);

-- 5. DRAWS (monthly draws created by admin)
create table if not exists public.draws (
  id            uuid primary key default gen_random_uuid(),
  draw_date     date not null,
  status        text not null default 'pending', -- pending | published | closed
  winning_numbers integer[],
  jackpot_amount  numeric(10,2) default 0,
  four_match_pool numeric(10,2) default 0,
  three_match_pool numeric(10,2) default 0,
  draw_type     text not null default 'random', -- random | algorithmic
  created_at    timestamptz not null default now(),
  published_at  timestamptz
);

-- 6. DRAW ENTRIES (user participation in each draw)
create table if not exists public.draw_entries (
  id             uuid primary key default gen_random_uuid(),
  draw_id        uuid not null references public.draws(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  matched_numbers integer,
  prize_tier     text, -- '5_match' | '4_match' | '3_match' | null
  created_at     timestamptz not null default now(),
  unique (draw_id, user_id)
);

-- 7. WINNERS
create table if not exists public.winners (
  id             uuid primary key default gen_random_uuid(),
  draw_id        uuid not null references public.draws(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  prize_tier     text not null, -- '5_match' | '4_match' | '3_match'
  amount         numeric(10,2) not null,
  payment_status text not null default 'pending', -- pending | pending_review | paid | rejected
  proof_url      text,
  admin_notes    text,
  created_at     timestamptz not null default now(),
  paid_at        timestamptz
);

-- ── Row Level Security ──────────────────────────────────────

alter table public.user_profiles   enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.scores          enable row level security;
alter table public.draw_entries    enable row level security;
alter table public.winners         enable row level security;
alter table public.charities       enable row level security;
alter table public.draws           enable row level security;

-- user_profiles: users see/edit only their own
create policy "User reads own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "User updates own profile" on public.user_profiles for update using (auth.uid() = id);

-- subscriptions: users see only their own
create policy "User reads own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- scores: users CRUD only their own
create policy "User reads own scores" on public.scores for select using (auth.uid() = user_id);
create policy "User inserts own scores" on public.scores for insert with check (auth.uid() = user_id);
create policy "User updates own scores" on public.scores for update using (auth.uid() = user_id);
create policy "User deletes own scores" on public.scores for delete using (auth.uid() = user_id);

-- draw_entries: users see only their own
create policy "User reads own draw entries" on public.draw_entries for select using (auth.uid() = user_id);

-- winners: users see only their own
create policy "User reads own winnings" on public.winners for select using (auth.uid() = user_id);
create policy "User updates own proof" on public.winners for update using (auth.uid() = user_id);

-- charities: everyone can read
create policy "Anyone reads charities" on public.charities for select using (true);

-- draws: published draws are public; admin manages all
create policy "Anyone reads published draws" on public.draws for select using (status = 'published');

-- ── Indexes ────────────────────────────────────────────────

create index if not exists idx_scores_user_date   on public.scores(user_id, date desc);
create index if not exists idx_subscriptions_user  on public.subscriptions(user_id);
create index if not exists idx_draw_entries_user   on public.draw_entries(user_id);
create index if not exists idx_winners_user        on public.winners(user_id);
create index if not exists idx_draw_entries_draw   on public.draw_entries(draw_id);
