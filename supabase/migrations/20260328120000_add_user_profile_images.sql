alter table public.users
  add column if not exists image_url text;

alter table public.drivers
  add column if not exists image_url text;

update public.drivers
set image_url = users.image_url
from public.users
where public.drivers.user_id = users.id
  and public.drivers.image_url is null;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'user-images',
  'user-images',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
