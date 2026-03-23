import { z } from "zod";
import { textIdSchema } from "./common";

export const cartStatusSchema = z.enum(["active", "checked_out", "abandoned"]);

export const createCartSchema = z.object({
  customer_id: textIdSchema,
  status: cartStatusSchema.default("active"),
});

export const updateCartSchema = z.object({
  customer_id: textIdSchema.optional(),
  status: cartStatusSchema.optional(),
});

export const createCartItemSchema = z.object({
  cart_id: textIdSchema,
  product_id: textIdSchema,
  quantity: z.coerce.number().positive(),
  unit_price: z.coerce.number().min(0),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().positive().optional(),
  unit_price: z.coerce.number().min(0).optional(),
});

export const addCartItemSchema = z.object({
  customer_id: textIdSchema,
  product_id: textIdSchema,
  quantity: z.coerce.number().positive(),
});

export const checkoutCartSchema = z.object({
  customer_id: textIdSchema,
  notes: z.string().trim().max(2000).nullable().optional(),
});
