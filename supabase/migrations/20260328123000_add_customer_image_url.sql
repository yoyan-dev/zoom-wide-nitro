alter table public.customers
  add column if not exists image_url text;

update public.customers
set image_url = users.image_url
from public.users
where public.customers.user_id = users.id
  and public.customers.image_url is null;
