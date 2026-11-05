-- À coller dans Supabase : SQL Editor > New query > Run
create table if not exists public.collections(
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null default '{}', updated_at timestamptz not null default now());
create table if not exists public.price_history(
  user_id uuid references auth.users on delete cascade, card_key text, day date,
  eur numeric, trend numeric, avg7 numeric, avg30 numeric, primary key(user_id,card_key,day));
alter table public.collections enable row level security;
alter table public.price_history enable row level security;
create policy "ma collection" on public.collections for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "mes prix" on public.price_history for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
