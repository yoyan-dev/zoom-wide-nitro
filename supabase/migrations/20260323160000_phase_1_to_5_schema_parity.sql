create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_role_check check (
    role in (
      'admin',
      'manager',
      'staff',
      'customer',
      'warehouse_manager',
      'finance',
      'driver',
      'supplier',
      'auditor'
    )
  )
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  company_name text not null,
  contact_name text not null,
  phone text,
  email text not null,
  billing_address text,
  shipping_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_status_check check (
    status in ('active', 'checked_out', 'abandoned')
  )
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.cart(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity numeric(12, 2) not null,
  unit_price numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_quantity_check check (quantity > 0),
  constraint cart_items_unit_price_check check (unit_price >= 0)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null default 'pending',
  total_amount numeric(12, 2) not null default 0,
  notes text,
  approved_by uuid references auth.users(id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (
    status in ('pending', 'approved', 'rejected', 'cancelled', 'completed')
  ),
  constraint orders_total_amount_check check (total_amount >= 0)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity numeric(12, 2) not null,
  unit_price numeric(12, 2) not null,
  line_total numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_items_quantity_check check (quantity > 0),
  constraint order_items_unit_price_check check (unit_price >= 0),
  constraint order_items_line_total_check check (line_total >= 0)
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  driver_id uuid references auth.users(id) on delete set null,
  vehicle_number text,
  status text not null default 'scheduled',
  scheduled_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deliveries_status_check check (
    status in ('scheduled', 'in_transit', 'delivered', 'failed', 'cancelled')
  )
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(12, 2) not null,
  method text not null,
  status text not null default 'pending',
  transaction_ref text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_check check (amount >= 0),
  constraint payments_method_check check (
    method in ('cash', 'card', 'bank_transfer', 'mobile_wallet')
  ),
  constraint payments_status_check check (
    status in ('pending', 'paid', 'failed', 'refunded')
  )
);

create index if not exists idx_users_role
  on public.users(role);

create index if not exists idx_users_is_active
  on public.users(is_active);

create index if not exists idx_customers_user_id
  on public.customers(user_id);

create index if not exists idx_customers_email
  on public.customers(email);

create index if not exists idx_cart_customer_id
  on public.cart(customer_id);

create index if not exists idx_cart_status
  on public.cart(status);

create unique index if not exists idx_cart_active_customer_unique
  on public.cart(customer_id)
  where status = 'active';

create index if not exists idx_cart_items_cart_id
  on public.cart_items(cart_id);

create index if not exists idx_cart_items_product_id
  on public.cart_items(product_id);

create unique index if not exists idx_cart_items_cart_product_unique
  on public.cart_items(cart_id, product_id);

create index if not exists idx_orders_customer_id
  on public.orders(customer_id);

create index if not exists idx_orders_status
  on public.orders(status);

create index if not exists idx_orders_created_at
  on public.orders(created_at desc);

create index if not exists idx_orders_approved_by
  on public.orders(approved_by);

create index if not exists idx_order_items_order_id
  on public.order_items(order_id);

create index if not exists idx_order_items_product_id
  on public.order_items(product_id);

create unique index if not exists idx_order_items_order_product_unique
  on public.order_items(order_id, product_id);

create unique index if not exists idx_deliveries_order_id_unique
  on public.deliveries(order_id);

create index if not exists idx_deliveries_driver_id
  on public.deliveries(driver_id);

create index if not exists idx_deliveries_status
  on public.deliveries(status);

create index if not exists idx_deliveries_created_at
  on public.deliveries(created_at desc);

create unique index if not exists idx_payments_order_id_unique
  on public.payments(order_id);

create index if not exists idx_payments_status
  on public.payments(status);

create index if not exists idx_payments_method
  on public.payments(method);

create index if not exists idx_payments_created_at
  on public.payments(created_at desc);

create index if not exists idx_inventory_logs_created_at
  on public.inventory_logs(created_at desc);

create index if not exists idx_products_created_at
  on public.products(created_at desc);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

drop trigger if exists set_cart_updated_at on public.cart;
create trigger set_cart_updated_at
before update on public.cart
for each row
execute function public.set_updated_at();

drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at
before update on public.cart_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists set_order_items_updated_at on public.order_items;
create trigger set_order_items_updated_at
before update on public.order_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_deliveries_updated_at on public.deliveries;
create trigger set_deliveries_updated_at
before update on public.deliveries
for each row
execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();
