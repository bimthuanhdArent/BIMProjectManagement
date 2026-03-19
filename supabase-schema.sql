-- Chạy trong Supabase Dashboard → SQL Editor (chạy toàn bộ script)

-- 1. Bảng projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  warnings int not null default 0,
  file_size_mb numeric not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);

-- Bắt buộc: cấp quyền cho role authenticated (thiếu bước này sẽ báo "permission denied")
grant usage on schema public to authenticated;
grant all on public.projects to authenticated;

-- RLS: chỉ user đọc/sửa dự án của mình
alter table public.projects enable row level security;

-- Xóa policy cũ nếu đã tạo (tránh lỗi duplicate)
drop policy if exists "Users can read own projects" on public.projects;
drop policy if exists "Users can insert own projects" on public.projects;
drop policy if exists "Users can delete own projects" on public.projects;

create policy "Users can read own projects"
  on public.projects for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  to authenticated
  using (auth.uid() = user_id);

-- 2. Storage bucket project-images (public)
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

-- Xóa policy cũ nếu đã tạo (tránh lỗi duplicate)
drop policy if exists "Authenticated users can upload project images" on storage.objects;
drop policy if exists "Public read project images" on storage.objects;

-- Policy: user đã đăng nhập được upload vào project-images
create policy "Authenticated users can upload project images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

-- Policy: ai cũng xem được ảnh (public read)
create policy "Public read project images"
  on storage.objects for select
  to public
  using (bucket_id = 'project-images');
