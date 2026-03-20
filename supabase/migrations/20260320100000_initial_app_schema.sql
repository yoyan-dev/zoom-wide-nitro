create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.categories (
  id text primary key,
  name text not null,
  description text not null,
  image_url text not null,
  overview text,
  typical_uses text[] not null default '{}',
  buying_considerations text[] not null default '{}',
  featured_specs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_featured_specs_array_check check (
    jsonb_typeof(featured_specs) = 'array'
  )
);

create table if not exists public.suppliers (
  id text primary key,
  name text not null,
  contact_name text,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.warehouses (
  id text primary key,
  name text not null,
  address text not null,
  manager_id text,
  capacity integer not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint warehouses_capacity_check check (capacity >= 0),
  constraint warehouses_status_check check (
    status in ('active', 'inactive', 'archived')
  )
);

create table if not exists public.products (
  id text primary key,
  category_id text not null references public.categories(id),
  supplier_id text references public.suppliers(id) on delete set null,
  warehouse_id text references public.warehouses(id) on delete set null,
  sku text not null unique,
  name text not null,
  description text,
  image_url text,
  unit text not null,
  price numeric(12, 2) not null,
  stock_quantity numeric(12, 2) not null default 0,
  minimum_stock_quantity numeric(12, 2) not null default 0,
  handbook jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_check check (price >= 0),
  constraint products_stock_quantity_check check (stock_quantity >= 0),
  constraint products_minimum_stock_quantity_check check (
    minimum_stock_quantity >= 0
  ),
  constraint products_handbook_object_check check (
    handbook is null or jsonb_typeof(handbook) = 'object'
  )
);

create table if not exists public.inventory_logs (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  movement_type text not null,
  quantity_change numeric(12, 2) not null,
  reference_type text,
  reference_id text,
  note text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_logs_movement_type_check check (
    movement_type in ('in', 'out', 'adjustment')
  ),
  constraint inventory_logs_quantity_change_positive_check check (
    quantity_change > 0
  )
);

create index if not exists idx_products_category_id
  on public.products(category_id);

create index if not exists idx_products_supplier_id
  on public.products(supplier_id);

create index if not exists idx_products_warehouse_id
  on public.products(warehouse_id);

create index if not exists idx_products_is_active
  on public.products(is_active);

create index if not exists idx_inventory_logs_product_id
  on public.inventory_logs(product_id);

create index if not exists idx_inventory_logs_movement_type
  on public.inventory_logs(movement_type);

create index if not exists idx_inventory_logs_reference
  on public.inventory_logs(reference_type, reference_id);

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists set_suppliers_updated_at on public.suppliers;
create trigger set_suppliers_updated_at
before update on public.suppliers
for each row
execute function public.set_updated_at();

drop trigger if exists set_warehouses_updated_at on public.warehouses;
create trigger set_warehouses_updated_at
before update on public.warehouses
for each row
execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_inventory_logs_updated_at on public.inventory_logs;
create trigger set_inventory_logs_updated_at
before update on public.inventory_logs
for each row
execute function public.set_updated_at();
