create or replace function public.create_product_admin(
  p_category_id uuid,
  p_supplier_id uuid default null,
  p_warehouse_id uuid default null,
  p_sku text default null,
  p_name text default null,
  p_description text default null,
  p_image_url text default null,
  p_unit text default null,
  p_price numeric default null,
  p_stock_quantity numeric default 0,
  p_minimum_stock_quantity numeric default 0,
  p_handbook jsonb default null,
  p_is_active boolean default true
)
returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  created_product public.products;
begin
  insert into public.products (
    category_id,
    supplier_id,
    warehouse_id,
    sku,
    name,
    description,
    image_url,
    unit,
    price,
    stock_quantity,
    minimum_stock_quantity,
    handbook,
    is_active
  )
  values (
    p_category_id,
    p_supplier_id,
    p_warehouse_id,
    p_sku,
    p_name,
    p_description,
    p_image_url,
    p_unit,
    p_price,
    coalesce(p_stock_quantity, 0),
    coalesce(p_minimum_stock_quantity, 0),
    p_handbook,
    coalesce(p_is_active, true)
  )
  returning * into created_product;

  return created_product;
end;
$$;

grant execute on function public.create_product_admin(
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  numeric,
  numeric,
  numeric,
  jsonb,
  boolean
) to anon, authenticated, service_role;
