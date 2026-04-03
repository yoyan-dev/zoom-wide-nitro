import { z } from "zod";
import { paginationQuerySchema, textIdSchema } from "./common";

export const productSpecificationSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

export const productHandbookDetailsSchema = z.object({
  summary: z.string().trim().min(1).optional(),
  features: z.array(z.string().trim().min(1)).optional(),
  applications: z.array(z.string().trim().min(1)).optional(),
  specifications: z.array(productSpecificationSchema).optional(),
});

export const createProductSchema = z.object({
  category_id: textIdSchema,
  warehouse_id: textIdSchema.nullable().optional(),
  sku: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).nullable().optional(),
  image_url: z.string().trim().url().nullable().optional(),
  unit: z.string().trim().min(1).max(30),
  price: z.coerce.number().min(0),
  stock_quantity: z.coerce.number().min(0).default(0),
  minimum_stock_quantity: z.coerce.number().min(0).default(0),
  handbook: productHandbookDetailsSchema.optional(),
  is_active: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  category_id: z.string().trim().optional(),
});
