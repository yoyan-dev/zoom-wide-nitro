create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  street text not null,
  city text not null,
  province text not null,
  postal_code text,
  country text,
  address_line text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customer_addresses_customer_id
  on public.customer_addresses(customer_id);

create index if not exists idx_customer_addresses_created_at
  on public.customer_addresses(created_at desc);

drop trigger if exists set_customer_addresses_updated_at on public.customer_addresses;
create trigger set_customer_addresses_updated_at
before update on public.customer_addresses
for each row
execute function public.set_updated_at();
