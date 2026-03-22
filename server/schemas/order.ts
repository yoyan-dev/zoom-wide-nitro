import { z } from "zod";
import { paginationQuerySchema, textIdSchema } from "./common";

export const orderStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "completed",
]);

export const createOrderSchema = z.object({
  customer_id: textIdSchema,
  status: orderStatusSchema.default("pending"),
  total_amount: z.coerce.number().min(0).default(0),
  notes: z.string().trim().max(2000).nullable().optional(),
  approved_by: textIdSchema.nullable().optional(),
  rejection_reason: z.string().trim().max(500).nullable().optional(),
});

export const updateOrderSchema = createOrderSchema.partial();

export const createOrderRequestItemSchema = z.object({
  product_id: textIdSchema,
  quantity: z.coerce.number().positive(),
});

export const createOrderRequestSchema = z.object({
  customer_id: textIdSchema,
  notes: z.string().trim().max(2000).nullable().optional(),
  items: z.array(createOrderRequestItemSchema).min(1),
});

export const approveOrderSchema = z.object({
  approved_by: textIdSchema.nullable().optional(),
});

export const rejectOrderSchema = z.object({
  rejection_reason: z.string().trim().min(1).max(500),
});

export const orderQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  status: orderStatusSchema.or(z.literal("")).optional(),
  customer_id: z.string().trim().optional(),
});

export const createOrderItemSchema = z.object({
  order_id: textIdSchema,
  product_id: textIdSchema,
  quantity: z.coerce.number().positive(),
  unit_price: z.coerce.number().min(0),
  line_total: z.coerce.number().min(0).optional(),
});

export const updateOrderItemSchema = z.object({
  product_id: textIdSchema.optional(),
  quantity: z.coerce.number().positive().optional(),
  unit_price: z.coerce.number().min(0).optional(),
  line_total: z.coerce.number().min(0).optional(),
});
