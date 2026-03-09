# Zoom Backend (Nitro + Supabase)

Nitro backend for a construction materials ordering system with Supabase integration.

## Project Structure

```text
zoom-backend/
├─ nitro.config.ts
├─ package.json
├─ tsconfig.json
├─ .env.example
├─ README.md
├─ shared/
│  └─ types/
│     ├─ tables.ts
│     ├─ database.ts
│     └─ index.ts
├─ supabase/
│  └─ migrations/
│     └─ 0001_init_construction_ordering.sql
└─ server/
   ├─ plugins/
   │  └─ supabase.ts
   ├─ middleware/
   │  ├─ auth.ts
   │  └─ admin.ts
   ├─ types/
   │  ├─ h3.d.ts
   │  ├─ tables.ts
   │  ├─ dtos.ts
   │  └─ index.ts
   ├─ repositories/
   │  ├─ user.repo.ts
   │  ├─ customer.repo.ts
   │  ├─ category.repo.ts
   │  ├─ supplier.repo.ts
   │  ├─ product.repo.ts
   │  ├─ cart.repo.ts
   │  ├─ order.repo.ts
   │  ├─ delivery.repo.ts
   │  ├─ inventory.repo.ts
   │  └─ payment.repo.ts
   ├─ services/
   │  ├─ category.service.ts
   │  ├─ customer.service.ts
   │  ├─ product.service.ts
   │  ├─ cart.service.ts
   │  ├─ order.service.ts
   │  ├─ delivery.service.ts
   │  ├─ inventory.service.ts
   │  └─ payment.service.ts
   ├─ api/
   │  ├─ products/
   │  ├─ categories/
   │  ├─ customers/
   │  ├─ cart/
   │  ├─ orders/
   │  ├─ deliveries/
   │  └─ inventory/
   └─ routes/
      └─ index.ts
```

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project

## Installation

```bash
npm install
```

## Environment Setup

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Set values in `.env.local`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Database Setup (Supabase)

Run the SQL migration:

- File: `supabase/migrations/0001_init_construction_ordering.sql`
- Use Supabase SQL Editor, or `supabase db push` if using Supabase CLI.

This migration creates:

- `users`
- `customers`
- `categories`
- `suppliers`
- `products`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `deliveries`
- `inventory_logs`
- `payments`

## Run Development Server

```bash
npm run dev
```

Default URL:

```text
http://localhost:3000
```

## Build and Preview

```bash
npm run build
npm run preview
```

## API Endpoints

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products/create`
- `PUT /api/products/update`
- `DELETE /api/products/delete?id=<product_id>`

### Categories

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories/create`
- `PUT /api/categories/update`
- `DELETE /api/categories/delete?id=<category_id>`

### Customers

- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers/create`

### Cart

- `GET /api/cart/get?customer_id=<customer_id>`
- `POST /api/cart/add`
- `POST /api/cart/remove`
- `POST /api/cart/clear`

### Orders

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders/create`
- `POST /api/orders/approve`
- `POST /api/orders/reject`

### Deliveries

- `GET /api/deliveries`
- `POST /api/deliveries/create`
- `POST /api/deliveries/update-status`

### Inventory

- `GET /api/inventory/stock`
- `POST /api/inventory/movement`

## Auth and RBAC

- `server/middleware/auth.ts`: validates Supabase JWT via `supabase.auth.getUser()`.
- `server/middleware/admin.ts`: resolves user role and enforces permission-based RBAC.

Supported roles:

- `admin`
- `manager`
- `staff`
- `customer`
- `warehouse_manager`
- `finance`
- `driver`
- `supplier`
- `auditor`

Use bearer token:

```http
Authorization: Bearer <supabase_access_token>
```

## Example API Usage

Create category:

```bash
curl -X POST http://localhost:3000/api/categories/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cement",
    "description": "Cement and binding products"
  }'
```

Create product:

```bash
curl -X POST http://localhost:3000/api/products/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "2fa3e8db-c788-4682-8a09-c6e1f68f6f09",
    "sku": "CEM-001",
    "name": "Portland Cement 50kg",
    "price": 8.5,
    "stock_quantity": 100,
    "minimum_stock_quantity": 15
  }'
```

Create order:

```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "3b8e2e57-e6ef-4930-9e12-a39d2bce5f45",
    "notes": "Deliver before 5 PM",
    "items": [
      { "product_id": "b9f8e3bc-a3ca-43fc-a3c4-c1fcd23f1cdf", "quantity": 10 }
    ]
  }'
```
