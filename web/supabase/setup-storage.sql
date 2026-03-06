create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update
set public = excluded.public;

create table if not exists public.clips (
  id text primary key default gen_random_uuid()::text,
  player_id text not null,
  title text not null,
  video_url text not null,
  poster_url text,
  duration_sec integer not null check (duration_sec > 0),
  tags text[] not null default '{}',
  notes text not null default '',
  game_id text,
  tournament_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists clips_player_id_idx on public.clips (player_id);
create index if not exists clips_game_id_idx on public.clips (game_id);
create index if not exists clips_tournament_id_idx on public.clips (tournament_id);
create index if not exists clips_created_at_idx on public.clips (created_at desc);

alter table public.clips enable row level security;

drop policy if exists "Public clips read" on public.clips;
create policy "Public clips read"
on public.clips
for select
using (true);

drop policy if exists "Public clips write" on public.clips;
create policy "Public clips write"
on public.clips
for all
using (true)
with check (true);

drop policy if exists "Public media read" on storage.objects;
create policy "Public media read"
on storage.objects
for select
using (bucket_id = 'media');

drop policy if exists "Public media write" on storage.objects;
create policy "Public media write"
on storage.objects
for all
using (bucket_id = 'media')
with check (bucket_id = 'media');
