-- ========== MOMEN ANGKATAN ==========
-- Galeri foto PIXEL'25. Foto diunggah admin langsung ke bucket "moments" lewat signed upload URL.

create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  caption text check (char_length(caption) <= 600),
  taken_on date not null default current_date,
  image_path text not null,
  image_url text not null,
  width int,
  height int,
  is_visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists moments_taken_idx on public.moments (taken_on desc, sort_order);

alter table public.moments enable row level security;

drop policy if exists moments_read on public.moments;
create policy moments_read on public.moments for select
  using (is_visible or public.is_admin());
drop policy if exists moments_admin_write on public.moments;
create policy moments_admin_write on public.moments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Bucket publik, hanya gambar, maks 10 MB per file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('moments', 'moments', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
