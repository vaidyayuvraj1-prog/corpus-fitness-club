-- ── CORPUS FITNESS CLUB (CFC) MULTI-DEVICE CLOUD SYNC TABLE ──────────────────
-- Run this query once in your Supabase project: SQL Editor > New query > Run

create table if not exists cfc_store (
  key text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable public read/write access for gym devices
alter table cfc_store enable row level security;

create policy "Allow all access to cfc_store"
  on cfc_store for all
  using (true)
  with check (true);

-- Enable Realtime broadcasting
alter publication supabase_realtime add table cfc_store;
