import { z } from "zod";

export const createProductSchema = z.object({
  category_id: z.uuid(),
  supplier_id: z.uuid().nullable().optional(),
  sku: z.string().min(2).max(60),
  name: z.string().min(2).max(160),
  description: z.string().max(2000).nullable().optional(),
  image_url: z.url().nullable().optional(),
  unit: z.string().min(1).max(30),
  price: z.coerce.number().min(0),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  minimum_stock_quantity: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  q: z.string().optional(),
  category_id: z.uuid().optional(),
  supplier_id: z.uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});
