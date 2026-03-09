create extension if not exists "pgcrypto";

do $$
begin
  create type user_role as enum (
    'admin',
    'manager',
    'staff',
    'customer',
    'warehouse_manager',
    'finance',
    'driver',
    'supplier',
    'auditor'
  );
exception
  when duplicate_object then null;
end $$;

alter type public.user_role add value if not exists 'manager';
alter type public.user_role add value if not exists 'warehouse_manager';
alter type public.user_role add value if not exists 'finance';
alter type public.user_role add value if not exists 'driver';
alter type public.user_role add value if not exists 'supplier';
alter type public.user_role add value if not exists 'auditor';

do $$
begin
  create type cart_status as enum ('active', 'checked_out', 'abandoned');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type order_status as enum ('pending', 'approved', 'rejected', 'cancelled', 'completed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type delivery_status as enum ('scheduled', 'in_transit', 'delivered', 'failed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type inventory_movement_type as enum ('in', 'out', 'adjustment');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type payment_method as enum ('cash', 'card', 'bank_transfer', 'mobile_wallet');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  role user_role not null default 'customer',
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  company_name text not null,
  contact_name text not null,
  phone text,
  email text not null unique,
  billing_address text,
  shipping_address text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  contact_name text,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  supplier_id uuid references public.suppliers(id) on delete set null,
  sku text not null unique,
  name text not null,
  description text,
  image_url text,
  unit text not null default 'pcs',
  price numeric(12,2) not null check (price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  minimum_stock_quantity integer not null default 0 check (minimum_stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  status cart_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (cart_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  status order_status not null default 'pending',
  total_amount numeric(12,2) not null check (total_amount >= 0),
  notes text,
  approved_by uuid references public.users(id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  driver_name text,
  vehicle_number text,
  status delivery_status not null default 'scheduled',
  scheduled_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  movement_type inventory_movement_type not null,
  quantity_change integer not null,
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  method payment_method not null,
  status payment_status not null default 'pending',
  transaction_ref text,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_customers_user_id on public.customers(user_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_supplier_id on public.products(supplier_id);
create index if not exists idx_carts_customer_id on public.carts(customer_id);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_inventory_logs_product_id on public.inventory_logs(product_id);
create index if not exists idx_inventory_logs_created_at on public.inventory_logs(created_at);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_deliveries_status on public.deliveries(status);

alter table if exists public.categories
  add column if not exists image_url text;

alter table if exists public.products
  add column if not exists image_url text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'stock_qty'
  ) then
    alter table public.products rename column stock_qty to stock_quantity;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'min_stock'
  ) then
    alter table public.products rename column min_stock to minimum_stock_quantity;
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists trg_customers_set_updated_at on public.customers;
create trigger trg_customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

drop trigger if exists trg_categories_set_updated_at on public.categories;
create trigger trg_categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists trg_suppliers_set_updated_at on public.suppliers;
create trigger trg_suppliers_set_updated_at
before update on public.suppliers
for each row
execute function public.set_updated_at();

drop trigger if exists trg_products_set_updated_at on public.products;
create trigger trg_products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists trg_carts_set_updated_at on public.carts;
create trigger trg_carts_set_updated_at
before update on public.carts
for each row
execute function public.set_updated_at();

drop trigger if exists trg_cart_items_set_updated_at on public.cart_items;
create trigger trg_cart_items_set_updated_at
before update on public.cart_items
for each row
execute function public.set_updated_at();

drop trigger if exists trg_orders_set_updated_at on public.orders;
create trigger trg_orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists trg_order_items_set_updated_at on public.order_items;
create trigger trg_order_items_set_updated_at
before update on public.order_items
for each row
execute function public.set_updated_at();

drop trigger if exists trg_deliveries_set_updated_at on public.deliveries;
create trigger trg_deliveries_set_updated_at
before update on public.deliveries
for each row
execute function public.set_updated_at();

drop trigger if exists trg_payments_set_updated_at on public.payments;
create trigger trg_payments_set_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();
