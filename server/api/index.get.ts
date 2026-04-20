import { defineEventHandler, setHeader } from "h3";

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  access: string;
  input?: string;
  note?: string;
};

type Section = {
  title: string;
  endpoints: Endpoint[];
};

const registerExample = `POST /api/auth/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "strong-password",
  "role": "customer",
  "customer_type": "contractor",
  "company_name": "ABC Trading",
  "contact_name": "Jane Doe",
  "phone": "+63 900 000 0000",
  "billing_address": "Billing address",
  "shipping_address": "Shipping address"
}`;

const loginExample = `POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}`;

const refreshExample = `POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "<refresh_token>"
}`;

const successExample = `{
  "status": "ok",
  "statusCode": 200,
  "statusMessage": "ok",
  "data": {},
  "total": 1,
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}`;

const errorExample = `{
  "status": "error",
  "statusCode": 401,
  "statusMessage": "unauthorized",
  "data": null,
  "message": "Invalid email or password",
  "error": {
    "code": "unauthorized",
    "message": "Invalid email or password"
  }
}`;

const sections: Section[] = [
  {
    title: "System",
    endpoints: [
      { method: "GET", path: "/api", access: "public", note: "This guide." },
      {
        method: "GET",
        path: "/api/health",
        access: "public",
        note: "Health check.",
      },
    ],
  },
  {
    title: "Auth",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/register",
        access: "public",
        input:
          "json or multipart/form-data: email, password, role(customer|driver), customer_type?(customer only), company_name?(customer only), contact_name, phone?, image_url? or profile image file, billing_address?, shipping_address?",
        note: "Public signup is available for customer and driver only. Supplier accounts are admin-managed.",
      },
      {
        method: "POST",
        path: "/api/auth/login",
        access: "public",
        input: "json: email, password",
        note: "Use data.user.role for frontend routing. Customer logins include data.customer and supplier logins include data.supplier when linked records exist.",
      },
      {
        method: "POST",
        path: "/api/auth/refresh",
        access: "public",
        input: "json: refresh_token",
        note: "Returns a fresh session and refreshed user payload.",
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        access: "bearer access token + json refresh_token",
        input: "json: refresh_token, scope?",
        note: "Revokes the current session by default. Use scope=global to revoke all sessions.",
      },
      {
        method: "POST",
        path: "/api/auth/forgot-password",
        access: "public",
        input: "json: email, redirect_to?",
        note: "Sends a password reset email through Supabase.",
      },
    ],
  },
  {
    title: "Account",
    endpoints: [
      {
        method: "GET",
        path: "/api/account",
        access: "bearer: any authenticated active user",
        note: "Returns the logged-in user's account plus related customer, driver, or supplier profile when available.",
      },
      {
        method: "PATCH",
        path: "/api/account",
        access: "bearer: any authenticated active user",
        input:
          "json or multipart/form-data: email?, phone?, image_url? or profile image file, full_name?/name?/contact_name?, company_name?, billing_address?, shipping_address?, license_number?, vehicle_number?",
        note: "Updates the logged-in user's own account. Allowed fields depend on the user's role.",
      },
      {
        method: "POST",
        path: "/api/account/change-password",
        access: "bearer: any authenticated active user",
        input: "json: current_password, new_password",
        note: "Changes the logged-in user's password after verifying the current password.",
      },
    ],
  },
  {
    title: "Users",
    endpoints: [
      {
        method: "GET",
        path: "/api/users",
        access: "bearer: admin",
        input: "query: q?, page?, limit?",
        note: "Lists internal accounts only. Customers and drivers are excluded.",
      },
      {
        method: "POST",
        path: "/api/users",
        access: "bearer: admin",
        input:
          "json or multipart/form-data: email, password, full_name, phone?, image_url? or profile image file, role",
        note: "Creates internal accounts for the admin role. Use /api/suppliers for admin-managed supplier accounts, /api/drivers for admin-managed driver accounts, and /api/auth/register for customer or self-service driver signup.",
      },
      {
        method: "GET",
        path: "/api/users/:id",
        access: "bearer: admin",
      },
      {
        method: "PATCH",
        path: "/api/users/:id",
        access: "bearer: admin",
        input:
          "json or multipart/form-data: email?, password?, full_name?, phone?, image_url? or profile image file, role?, is_active?",
      },
      {
        method: "DELETE",
        path: "/api/users/:id",
        access: "bearer: admin",
      },
    ],
  },
  {
    title: "Suppliers",
    endpoints: [
      {
        method: "GET",
        path: "/api/suppliers",
        access: "bearer: admin",
        input: "query: q?, page?, limit?",
      },
      {
        method: "POST",
        path: "/api/suppliers",
        access: "bearer: admin",
        input:
          "json: email, password, business_name, contact_person, phone?, address?",
        note: "Creates a supplier profile plus a linked auth/user account with the supplier role.",
      },
      {
        method: "GET",
        path: "/api/suppliers/:id",
        access: "bearer: admin",
      },
      {
        method: "PATCH",
        path: "/api/suppliers/:id",
        access: "bearer: admin",
        input:
          "json: email?, password?, business_name?, contact_person?, phone?, address?, is_active?",
      },
      {
        method: "DELETE",
        path: "/api/suppliers/:id",
        access: "bearer: admin",
      },
    ],
  },
  {
    title: "Drivers",
    endpoints: [
      {
        method: "GET",
        path: "/api/drivers",
        access: "bearer: admin",
        input: "query: q?, page?, limit?",
      },
      {
        method: "POST",
        path: "/api/drivers",
        access: "bearer: admin",
        input:
          "json or multipart/form-data: email, password, name, phone?, image_url? or profile image file, license_number?, vehicle_number?",
        note: "Creates a driver profile plus a linked auth/user account with the driver role.",
      },
      {
        method: "GET",
        path: "/api/drivers/:id",
        access: "bearer: admin",
      },
      {
        method: "PATCH",
        path: "/api/drivers/:id",
        access: "bearer: admin",
        input:
          "json or multipart/form-data: email?, password?, name?, phone?, image_url? or profile image file, license_number?, vehicle_number?, is_active?",
      },
      {
        method: "DELETE",
        path: "/api/drivers/:id",
        access: "bearer: admin",
      },
      {
        method: "GET",
        path: "/api/drivers/:id/orders",
        access: "bearer: driver owner or admin",
        input: "query: q?, status?, from?, to?, page?, limit?",
        note: "Drivers can only use their own driver id. Lists that driver's assigned orders together with their delivery records.",
      },
      {
        method: "GET",
        path: "/api/drivers/:id/orders/:orderId",
        access: "bearer: driver owner or admin",
        note: "Drivers can only access order ids that are assigned to them. Returns a single assigned order plus its delivery details.",
      },
      {
        method: "POST",
        path: "/api/drivers/:id/orders/:orderId/delivered",
        access: "bearer: driver owner or admin",
        input: "json: delivered_at?",
        note: "Drivers can only mark their own assigned orders as delivered. Completes the delivery record and the related order workflow.",
      },
    ],
  },
  {
    title: "Categories",
    endpoints: [
      {
        method: "GET",
        path: "/api/categories",
        access: "public",
        input: "query: q?, page?, limit?",
      },
      { method: "GET", path: "/api/categories/:id", access: "public" },
      {
        method: "POST",
        path: "/api/categories",
        access: "bearer: admin",
        input:
          "multipart/form-data: name, description, overview?, typical_uses[], buying_considerations[], featured_specs(json array)",
      },
      {
        method: "PATCH",
        path: "/api/categories/:id",
        access: "bearer: admin",
        input: "json partial category fields",
      },
      {
        method: "DELETE",
        path: "/api/categories/:id",
        access: "bearer: admin",
      },
    ],
  },
  {
    title: "Products",
    endpoints: [
      {
        method: "GET",
        path: "/api/products",
        access: "public",
        input: "query: q?, category_id?, page?, limit?",
      },
      { method: "GET", path: "/api/products/:id", access: "public" },
      {
        method: "POST",
        path: "/api/products",
        access: "bearer: admin or supplier",
        input:
          "multipart/form-data: category_id, sku, name, description?, image_url? or image file, unit, price, stock_quantity?, minimum_stock_quantity?, handbook(json), is_active?",
      },
      {
        method: "PATCH",
        path: "/api/products/:id",
        access: "bearer: admin or supplier",
        input:
          "multipart/form-data partial product fields, optional image file",
      },
      {
        method: "DELETE",
        path: "/api/products/:id",
        access: "bearer: admin or supplier",
      },
      {
        method: "GET",
        path: "/api/products/insights",
        access: "bearer: admin or supplier",
        input: "query: limit?",
      },
    ],
  },
  {
    title: "Customers",
    endpoints: [
      {
        method: "GET",
        path: "/api/customers",
        access: "bearer: admin",
        input: "query: q?, page?, limit?",
      },
      {
        method: "POST",
        path: "/api/customers",
        access: "bearer: admin",
        input:
          "json or multipart/form-data: user_id?, company_name, contact_name, phone?, email, image_url? or profile image file, billing_address?, shipping_address?",
        note: "For public signup, use POST /api/auth/register.",
      },
      {
        method: "GET",
        path: "/api/customers/:id",
        access: "bearer: owner or customers:read",
      },
      {
        method: "PATCH",
        path: "/api/customers/:id",
        access: "bearer: owner or customers:write",
        input:
          "json or multipart/form-data partial customer fields, optional profile image file",
      },
      {
        method: "DELETE",
        path: "/api/customers/:id",
        access: "bearer: admin",
      },
      {
        method: "GET",
        path: "/api/customers/:id/addresses",
        access: "bearer: owner or customers:read",
        input: "query: q?, page?, limit?",
        note: "Lists delivery addresses for a customer.",
      },
      {
        method: "POST",
        path: "/api/customers/:id/addresses",
        access: "bearer: owner or customers:write",
        input:
          "json: street, city, province, postal_code?, country?, address_line?",
        note: "Creates a delivery address for a customer.",
      },
      {
        method: "GET",
        path: "/api/customers/:id/addresses/:addressId",
        access: "bearer: owner or customers:read",
      },
      {
        method: "PATCH",
        path: "/api/customers/:id/addresses/:addressId",
        access: "bearer: owner or customers:write",
        input:
          "json partial address fields: street?, city?, province?, postal_code?, country?, address_line?",
      },
      {
        method: "DELETE",
        path: "/api/customers/:id/addresses/:addressId",
        access: "bearer: owner or customers:write",
      },
    ],
  },
  {
    title: "Projects",
    endpoints: [
      {
        method: "GET",
        path: "/api/projects",
        access: "bearer: contractor customer",
        note: "Lists the authenticated contractor's own projects.",
      },
      {
        method: "POST",
        path: "/api/projects",
        access: "bearer: contractor customer",
        input: "json: name, location?, start_date?, end_date?",
      },
      {
        method: "PATCH",
        path: "/api/projects/:id",
        access: "bearer: contractor customer",
        input: "json partial project fields",
      },
      {
        method: "DELETE",
        path: "/api/projects/:id",
        access: "bearer: contractor customer",
      },
    ],
  },
  {
    title: "Cart",
    endpoints: [
      {
        method: "GET",
        path: "/api/cart",
        access: "bearer: owner or cart:read",
        input: "query: customer_id",
      },
      {
        method: "POST",
        path: "/api/cart/items",
        access: "bearer: owner or cart:write",
        input: "json: customer_id, product_id, quantity",
      },
      {
        method: "DELETE",
        path: "/api/cart/items/:id",
        access: "bearer: owner or cart:write",
        input: "query: customer_id",
      },
      {
        method: "DELETE",
        path: "/api/cart",
        access: "bearer: owner or cart:write",
        input: "query: customer_id",
      },
      {
        method: "POST",
        path: "/api/cart/checkout",
        access: "bearer: owner or cart:write",
        input: "json: customer_id, notes?",
      },
    ],
  },
  {
    title: "Orders",
    endpoints: [
      {
        method: "GET",
        path: "/api/orders",
        access: "bearer: report roles, or owner when filtering by customer_id",
        input: "query: q?, customer_id?, status?, from?, to?, page?, limit?",
      },
      {
        method: "GET",
        path: "/api/orders/summary",
        access: "bearer: report roles, or owner when filtering by customer_id",
        input: "query: q?, customer_id?, status?, from?, to?",
      },
      {
        method: "GET",
        path: "/api/orders/:id",
        access: "bearer: owner or orders:read",
      },
      {
        method: "POST",
        path: "/api/orders",
        access: "bearer: owner or orders:write",
        input:
          "json: customer_id, project_id?(contractors only), notes?, items[{ product_id, quantity }]",
      },
      {
        method: "POST",
        path: "/api/orders/:id/approve",
        access: "bearer: admin",
        input: "json: approved_by?",
      },
      {
        method: "POST",
        path: "/api/orders/:id/reject",
        access: "bearer: admin",
        input: "json: rejection_reason",
      },
    ],
  },
  {
    title: "Deliveries",
    endpoints: [
      {
        method: "GET",
        path: "/api/deliveries",
        access:
          "bearer: report roles, order owner by order_id, or driver owner by driver_id",
        input:
          "query: q?, order_id?, driver_id?, status?, from?, to?, page?, limit?",
      },
      {
        method: "GET",
        path: "/api/deliveries/summary",
        access:
          "bearer: report roles, order owner by order_id, or driver owner by driver_id",
        input: "query: q?, order_id?, driver_id?, status?, from?, to?",
      },
      {
        method: "POST",
        path: "/api/deliveries",
        access: "bearer: admin",
        input:
          "json: order_id, driver_id?, vehicle_number?, status?, scheduled_at?, delivered_at?",
        note: "driver_id must be a driver record id from /api/drivers.",
      },
      {
        method: "PATCH",
        path: "/api/deliveries/:id",
        access: "bearer: admin or assigned driver",
        input: "json: status, delivered_at?",
        note: "Drivers can only update deliveries assigned to them.",
      },
    ],
  },
  {
    title: "Inventory",
    endpoints: [
      {
        method: "GET",
        path: "/api/inventory",
        access: "bearer: admin or supplier",
        input: "query: q?, product_id?, stock_status?, page?, limit?",
      },
      {
        method: "GET",
        path: "/api/inventory/summary",
        access: "bearer: admin or supplier",
        input: "query: q?, product_id?",
      },
      {
        method: "GET",
        path: "/api/inventory/movements",
        access: "bearer: admin or supplier",
        input:
          "query: q?, product_id?, movement_type?, from?, to?, page?, limit?",
      },
      {
        method: "GET",
        path: "/api/inventory/movements/summary",
        access: "bearer: admin or supplier",
        input: "query: q?, product_id?, movement_type?, from?, to?",
      },
      {
        method: "POST",
        path: "/api/inventory",
        access: "bearer: admin or supplier",
        input:
          "json: product_id, movement_type, quantity_change, reference_type?, reference_id?, note?, created_by?",
        note: "reference_type and reference_id must be paired.",
      },
    ],
  },
  {
    title: "Payments",
    endpoints: [
      {
        method: "GET",
        path: "/api/payments",
        access: "bearer: admin or order owner by order_id",
        input:
          "query: q?, order_id?, status?, method?, from?, to?, page?, limit?",
      },
      {
        method: "GET",
        path: "/api/payments/summary",
        access: "bearer: admin or order owner by order_id",
        input: "query: q?, order_id?, status?, method?, from?, to?",
      },
      {
        method: "POST",
        path: "/api/payments",
        access: "bearer: admin or order owner",
        input:
          "json: order_id, amount, method, status?, transaction_ref?, paid_at?",
      },
      {
        method: "PATCH",
        path: "/api/payments/:id",
        access: "bearer: admin",
        input: "json: status, transaction_ref?, paid_at?",
      },
    ],
  },
  {
    title: "Dashboard",
    endpoints: [
      {
        method: "GET",
        path: "/api/dashboard/summary",
        access: "bearer: admin",
      },
      {
        method: "GET",
        path: "/api/dashboard/recent-activity",
        access: "bearer: admin",
        input: "query: limit?",
      },
    ],
  },
];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderEndpoint(endpoint: Endpoint): string {
  return `<li>
    <div><strong>${endpoint.method}</strong> <code>${escapeHtml(endpoint.path)}</code></div>
    <div class="meta">access: ${escapeHtml(endpoint.access)}</div>
    ${endpoint.input ? `<div class="meta">input: ${escapeHtml(endpoint.input)}</div>` : ""}
    ${endpoint.note ? `<div class="meta">note: ${escapeHtml(endpoint.note)}</div>` : ""}
  </li>`;
}

function renderSection(section: Section): string {
  return `<section>
    <h2>${escapeHtml(section.title)}</h2>
    <ul>
      ${section.endpoints.map(renderEndpoint).join("")}
    </ul>
  </section>`;
}

function renderHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>API Guide</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 1100px; margin: 24px auto; padding: 0 16px; line-height: 1.5; color: #222; }
      h1 { font-size: 28px; margin-bottom: 8px; }
      h2 { font-size: 20px; margin-top: 28px; margin-bottom: 10px; }
      p { margin: 8px 0; }
      ul { padding-left: 18px; }
      li { margin-bottom: 12px; }
      code, pre { font-family: Consolas, monospace; }
      code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
      pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow: auto; }
      .meta { color: #555; margin-top: 2px; }
      .box { border: 1px solid #ddd; padding: 12px; border-radius: 6px; margin: 16px 0; }
    </style>
  </head>
  <body>
    <h1>Backend API Guide</h1>
    <p>Base path: <code>/api</code></p>
    <p>Protected routes use: <code>Authorization: Bearer &lt;access_token&gt;</code></p>
    <p>After login, use <code>data.user.role</code> for frontend routing. For customer-owned routes, use <code>data.customer.id</code>.</p>
    <p>Use <code>POST /api/auth/refresh</code> to rotate sessions and <code>POST /api/auth/logout</code> to revoke them.</p>

    <div class="box">
      <strong>Examples</strong>
      <pre>${escapeHtml(registerExample)}</pre>
      <pre>${escapeHtml(loginExample)}</pre>
      <pre>${escapeHtml(refreshExample)}</pre>
      <pre>${escapeHtml(successExample)}</pre>
      <pre>${escapeHtml(errorExample)}</pre>
    </div>

    ${sections.map(renderSection).join("")}
  </body>
</html>`;
}

export default defineEventHandler((event) => {
  setHeader(event, "content-type", "text/html; charset=utf-8");
  return renderHtml();
});
