alter table public.suppliers
  add column if not exists user_id uuid references public.users(id) on delete cascade;

create unique index if not exists idx_suppliers_user_id_unique
  on public.suppliers(user_id)
  where user_id is not null;

update public.suppliers as s
set
  user_id = u.id,
  email = coalesce(s.email, u.email),
  contact_name = coalesce(s.contact_name, u.full_name),
  phone = coalesce(s.phone, u.phone)
from public.users as u
where s.user_id is null
  and u.role = 'supplier'
  and s.email is not null
  and lower(s.email) = lower(u.email);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  location text,
  description text,
  start_date date,
  end_date date,
  status text not null default 'active',
  progress numeric(5, 2) not null default 0,
  budget numeric(12, 2),
  total_orders integer not null default 0,
  total_spent numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_status_check check (
    status in ('active', 'completed', 'on_hold', 'cancelled')
  ),
  constraint projects_progress_check check (
    progress >= 0 and progress <= 100
  ),
  constraint projects_budget_check check (
    budget is null or budget >= 0
  ),
  constraint projects_total_orders_check check (
    total_orders >= 0
  ),
  constraint projects_total_spent_check check (
    total_spent >= 0
  )
);

alter table public.projects
  add column if not exists description text;

alter table public.projects
  add column if not exists status text not null default 'active';

alter table public.projects
  add column if not exists progress numeric(5, 2) not null default 0;

alter table public.projects
  add column if not exists budget numeric(12, 2);

alter table public.projects
  add column if not exists total_orders integer not null default 0;

alter table public.projects
  add column if not exists total_spent numeric(12, 2) not null default 0;

alter table public.projects
  add column if not exists updated_at timestamptz not null default now();

update public.projects
set
  status = coalesce(status, 'active'),
  progress = coalesce(progress, 0),
  total_orders = coalesce(total_orders, 0),
  total_spent = coalesce(total_spent, 0),
  updated_at = coalesce(updated_at, created_at, now());

alter table public.projects
  alter column status set default 'active';

alter table public.projects
  alter column progress set default 0;

alter table public.projects
  alter column total_orders set default 0;

alter table public.projects
  alter column total_spent set default 0;

alter table public.projects
  alter column updated_at set default now();

alter table public.projects
  alter column status set not null;

alter table public.projects
  alter column progress set not null;

alter table public.projects
  alter column total_orders set not null;

alter table public.projects
  alter column total_spent set not null;

alter table public.projects
  drop constraint if exists projects_status_check;

alter table public.projects
  add constraint projects_status_check
  check (status in ('active', 'completed', 'on_hold', 'cancelled'));

alter table public.projects
  drop constraint if exists projects_progress_check;

alter table public.projects
  add constraint projects_progress_check
  check (progress >= 0 and progress <= 100);

alter table public.projects
  drop constraint if exists projects_budget_check;

alter table public.projects
  add constraint projects_budget_check
  check (budget is null or budget >= 0);

alter table public.projects
  drop constraint if exists projects_total_orders_check;

alter table public.projects
  add constraint projects_total_orders_check
  check (total_orders >= 0);

alter table public.projects
  drop constraint if exists projects_total_spent_check;

alter table public.projects
  add constraint projects_total_spent_check
  check (total_spent >= 0);

create index if not exists idx_projects_user_id
  on public.projects(user_id);

create table if not exists public.project_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity numeric(12, 2) not null,
  unit_price numeric(12, 2) not null,
  total_price numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  constraint project_items_quantity_check check (quantity > 0),
  constraint project_items_unit_price_check check (unit_price >= 0),
  constraint project_items_total_price_check check (total_price >= 0),
  constraint project_items_project_product_unique unique (project_id, product_id)
);

create index if not exists idx_project_items_project_id
  on public.project_items(project_id);

create index if not exists idx_project_items_product_id
  on public.project_items(product_id);

create table if not exists public.project_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  total_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  constraint project_orders_order_id_unique unique (order_id),
  constraint project_orders_total_amount_check check (total_amount >= 0)
);

alter table public.project_orders
  add column if not exists total_amount numeric(12, 2) not null default 0;

update public.project_orders
set total_amount = coalesce(total_amount, 0);

alter table public.project_orders
  alter column total_amount set default 0;

alter table public.project_orders
  alter column total_amount set not null;

alter table public.project_orders
  drop constraint if exists project_orders_total_amount_check;

alter table public.project_orders
  add constraint project_orders_total_amount_check
  check (total_amount >= 0);

create index if not exists idx_project_orders_project_id
  on public.project_orders(project_id);

create or replace function public.ensure_project_owner_is_contractor()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.users
    where id = new.user_id
      and role = 'customer'
      and customer_type = 'contractor'
  ) then
    raise exception 'Only contractor customers can own projects';
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_project_owner_is_contractor on public.projects;
create trigger ensure_project_owner_is_contractor
before insert or update on public.projects
for each row
execute function public.ensure_project_owner_is_contractor();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();
