-- รันทั้งไฟล์นี้ใน Supabase Dashboard > SQL Editor (ครั้งเดียว)
-- ก่อนรัน: แก้อีเมลในฟังก์ชัน is_admin() ด้านล่างเป็นอีเมลแอดมินของคุณ

-- ---------- ตาราง ----------
create table if not exists public.categories (
  id         text primary key,
  label      text not null check (char_length(label) between 1 and 60),
  parent_id  text references public.categories (id) on delete restrict,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id          uuid primary key default gen_random_uuid(),
  src_path    text not null,
  thumb_path  text not null,
  caption     text not null default '' check (char_length(caption) <= 200),
  category_id text references public.categories (id) on update cascade on delete restrict,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- สิทธิ์: ใครก็อ่านได้ แต่เขียนได้เฉพาะแอดมิน ----------
create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'kunasincha.cop@gmail.com'  -- << แก้ตรงนี้
$$;

alter table public.categories enable row level security;
alter table public.photos     enable row level security;

drop policy if exists "categories read"  on public.categories;
drop policy if exists "categories write" on public.categories;
drop policy if exists "photos read"      on public.photos;
drop policy if exists "photos write"     on public.photos;

create policy "categories read"  on public.categories for select using (true);
create policy "categories write" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "photos read"  on public.photos for select using (true);
create policy "photos write" on public.photos for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- ที่เก็บรูป (public bucket: เปิดดูด้วย URL ได้ แต่ list/เขียนไม่ได้) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 10485760, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

drop policy if exists "photos bucket insert" on storage.objects;
drop policy if exists "photos bucket update" on storage.objects;
drop policy if exists "photos bucket delete" on storage.objects;

create policy "photos bucket insert" on storage.objects for insert
  with check (bucket_id = 'photos' and public.is_admin());
create policy "photos bucket update" on storage.objects for update
  using (bucket_id = 'photos' and public.is_admin());
create policy "photos bucket delete" on storage.objects for delete
  using (bucket_id = 'photos' and public.is_admin());

-- ---------- หมวดหมู่เริ่มต้น ----------
insert into public.categories (id, label, parent_id, sort_order) values
  ('deepsky',   'Deep Sky Object',    null,        1),
  ('landscape', 'Landscape',          null,        2),
  ('cityscape', 'Cityscape',          null,        3),
  ('phototrip', 'Photo Trip',         null,        4),
  ('cocktail',  'COCKTAIL EVER LIVE', 'phototrip', 5),
  ('newyear',   'New Year 2025',      'phototrip', 6)
on conflict (id) do nothing;
