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
      { method: "GET", path: "/api/health", access: "public", note: "Health check." },
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
          "json: email, password, company_name, contact_name, phone?, billing_address?, shipping_address?",
        note: "Customer-only signup. Call login after register.",
      },
      {
        method: "POST",
        path: "/api/auth/login",
        access: "public",
        input: "json: email, password",
        note: "Use data.user.role for frontend routing. Use data.customer.id for customer-owned flows.",
      },
    ],
  },
  {
    title: "Categories",
    endpoints: [
      { method: "GET", path: "/api/categories", access: "public", input: "query: q?, page?, limit?" },
      { method: "GET", path: "/api/categories/:id", access: "public" },
      {
        method: "POST",
        path: "/api/categories",
        access: "bearer: admin, manager",
        input:
          "multipart/form-data: name, description, overview?, typical_uses[], buying_considerations[], featured_specs(json array)",
      },
      {
        method: "PATCH",
        path: "/api/categories/:id",
        access: "bearer: admin, manager",
        input: "json partial category fields",
      },
      { method: "DELETE", path: "/api/categories/:id", access: "bearer: admin, manager" },
    ],
  },
  {
    title: "Products",
    endpoints: [
      {
        method: "GET",
        path: "/api/products",
        access: "public",
        input: "query: q?, category_id?, supplier_id?, page?, limit?",
      },
      { method: "GET", path: "/api/products/:id", access: "public" },
      {
        method: "POST",
        path: "/api/products",
        access: "bearer: admin, manager, warehouse_manager",
        input:
          "multipart/form-data: category_id, supplier_id?, warehouse_id?, sku, name, description?, image_url? or image file, unit, price, stock_quantity?, minimum_stock_quantity?, handbook(json), is_active?",
      },
      {
        method: "PATCH",
        path: "/api/products/:id",
        access: "bearer: admin, manager, warehouse_manager",
        input: "multipart/form-data partial product fields, optional image file",
      },
      {
        method: "DELETE",
        path: "/api/products/:id",
        access: "bearer: admin, manager, warehouse_manager",
      },
      {
        method: "GET",
        path: "/api/products/insights",
        access: "bearer: admin, manager, warehouse_manager",
        input: "query: limit?",
      },
    ],
  },
  {
    title: "Suppliers",
    endpoints: [
      { method: "GET", path: "/api/suppliers", access: "public", input: "query: q?, page?, limit?" },
      { method: "GET", path: "/api/suppliers/:id", access: "public" },
      {
        method: "POST",
        path: "/api/suppliers",
        access: "bearer: admin, manager",
        input: "multipart/form-data: name, contact_name?, phone?, email?, address?",
      },
      {
        method: "PATCH",
        path: "/api/suppliers/:id",
        access: "bearer: admin, manager",
        input: "json partial supplier fields",
      },
      { method: "DELETE", path: "/api/suppliers/:id", access: "bearer: admin, manager" },
    ],
  },
  {
    title: "Warehouses",
    endpoints: [
      { method: "GET", path: "/api/warehouses", access: "public", input: "query: q?, status?, page?, limit?" },
      { method: "GET", path: "/api/warehouses/:id", access: "public" },
      {
        method: "POST",
        path: "/api/warehouses",
        access: "no explicit route auth check",
        input: "multipart/form-data: name, address, manager_id?, capacity, status?",
      },
      {
        method: "PATCH",
        path: "/api/warehouses/:id",
        access: "no explicit route auth check",
        input: "json partial warehouse fields",
      },
      { method: "DELETE", path: "/api/warehouses/:id", access: "no explicit route auth check" },
    ],
  },
  {
    title: "Customers",
    endpoints: [
      {
        method: "GET",
        path: "/api/customers",
        access: "bearer: admin, manager, staff, finance, auditor",
        input: "query: q?, page?, limit?",
      },
      {
        method: "POST",
        path: "/api/customers",
        access: "bearer: admin, manager, staff",
        input:
          "json: user_id?, company_name, contact_name, phone?, email, billing_address?, shipping_address?",
        note: "For public signup, use POST /api/auth/register.",
      },
      { method: "GET", path: "/api/customers/:id", access: "bearer: owner or customers:read" },
      {
        method: "PATCH",
        path: "/api/customers/:id",
        access: "bearer: owner or customers:write",
        input: "json partial customer fields",
      },
      { method: "DELETE", path: "/api/customers/:id", access: "bearer: admin, manager, staff" },
    ],
  },
  {
    title: "Cart",
    endpoints: [
      { method: "GET", path: "/api/cart", access: "bearer: owner or cart:read", input: "query: customer_id" },
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
      { method: "DELETE", path: "/api/cart", access: "bearer: owner or cart:write", input: "query: customer_id" },
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
      { method: "GET", path: "/api/orders/:id", access: "bearer: owner or orders:read" },
      {
        method: "POST",
        path: "/api/orders",
        access: "bearer: owner or orders:write",
        input: "json: customer_id, notes?, items[{ product_id, quantity }]",
      },
      {
        method: "POST",
        path: "/api/orders/:id/approve",
        access: "bearer: admin, manager",
        input: "json: approved_by?",
      },
      {
        method: "POST",
        path: "/api/orders/:id/reject",
        access: "bearer: admin, manager",
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
        access: "bearer: report roles, order owner by order_id, or driver owner by driver_id",
        input: "query: q?, order_id?, driver_id?, status?, from?, to?, page?, limit?",
      },
      {
        method: "GET",
        path: "/api/deliveries/summary",
        access: "bearer: report roles, order owner by order_id, or driver owner by driver_id",
        input: "query: q?, order_id?, driver_id?, status?, from?, to?",
      },
      {
        method: "POST",
        path: "/api/deliveries",
        access: "bearer: admin, manager",
        input: "json: order_id, driver_id?, vehicle_number?, status?, scheduled_at?, delivered_at?",
      },
      {
        method: "PATCH",
        path: "/api/deliveries/:id",
        access: "bearer: admin, manager, driver",
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
        access: "bearer: admin, manager, warehouse_manager, auditor",
        input: "query: q?, product_id?, stock_status?, page?, limit?",
      },
      {
        method: "GET",
        path: "/api/inventory/summary",
        access: "bearer: admin, manager, warehouse_manager, auditor",
        input: "query: q?, product_id?",
      },
      {
        method: "GET",
        path: "/api/inventory/movements",
        access: "bearer: admin, manager, warehouse_manager, auditor",
        input: "query: q?, product_id?, movement_type?, from?, to?, page?, limit?",
      },
      {
        method: "GET",
        path: "/api/inventory/movements/summary",
        access: "bearer: admin, manager, warehouse_manager, auditor",
        input: "query: q?, product_id?, movement_type?, from?, to?",
      },
      {
        method: "POST",
        path: "/api/inventory",
        access: "bearer: admin, manager, warehouse_manager",
        input: "json: product_id, movement_type, quantity_change, reference_type?, reference_id?, note?, created_by?",
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
        access: "bearer: admin, finance, auditor, or order owner by order_id",
        input: "query: q?, order_id?, status?, method?, from?, to?, page?, limit?",
      },
      {
        method: "GET",
        path: "/api/payments/summary",
        access: "bearer: admin, finance, auditor, or order owner by order_id",
        input: "query: q?, order_id?, status?, method?, from?, to?",
      },
      {
        method: "POST",
        path: "/api/payments",
        access: "bearer: admin, finance, or order owner",
        input: "json: order_id, amount, method, status?, transaction_ref?, paid_at?",
      },
      {
        method: "PATCH",
        path: "/api/payments/:id",
        access: "bearer: admin, finance",
        input: "json: status, transaction_ref?, paid_at?",
      },
    ],
  },
  {
    title: "Dashboard",
    endpoints: [
      { method: "GET", path: "/api/dashboard/summary", access: "bearer: admin, manager" },
      {
        method: "GET",
        path: "/api/dashboard/recent-activity",
        access: "bearer: admin, manager",
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

    <div class="box">
      <strong>Examples</strong>
      <pre>${escapeHtml(registerExample)}</pre>
      <pre>${escapeHtml(loginExample)}</pre>
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
