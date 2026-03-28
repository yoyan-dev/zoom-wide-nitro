create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  license_number text,
  vehicle_number text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_drivers_user_id
  on public.drivers(user_id);

create index if not exists idx_drivers_email
  on public.drivers(email);

create index if not exists idx_drivers_is_active
  on public.drivers(is_active);

insert into public.drivers (
  user_id,
  name,
  phone,
  email,
  is_active,
  created_at,
  updated_at
)
select
  users.id,
  users.full_name,
  users.phone,
  users.email,
  users.is_active,
  users.created_at,
  users.updated_at
from public.users
where users.role = 'driver'
on conflict (user_id) do nothing;

alter table public.deliveries
  drop constraint if exists deliveries_driver_id_fkey;

update public.deliveries
set driver_id = drivers.id
from public.drivers
where public.deliveries.driver_id = drivers.user_id;

update public.deliveries
set driver_id = null
where driver_id is not null
  and not exists (
    select 1
    from public.drivers
    where public.drivers.id = public.deliveries.driver_id
  );

alter table public.deliveries
  add constraint deliveries_driver_id_fkey
  foreign key (driver_id) references public.drivers(id) on delete set null;

drop trigger if exists set_drivers_updated_at on public.drivers;
create trigger set_drivers_updated_at
before update on public.drivers
for each row
execute function public.set_updated_at();
