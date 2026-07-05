create table if not exists public.karate_entries (
  id uuid default gen_random_uuid() primary key,
  date text not null,
  topic text not null,
  description text not null,
  created_at timestamp with time zone default now()
);

comment on table public.karate_entries is 'Registros de clases de karate para la bitácora';
