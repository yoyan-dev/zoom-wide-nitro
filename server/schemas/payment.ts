import { z } from "zod";
import { paginationQuerySchema, textIdSchema } from "./common";

export const paymentMethodSchema = z.enum([
  "cash",
  "card",
  "bank_transfer",
  "mobile_wallet",
]);

export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const createPaymentSchema = z.object({
  order_id: textIdSchema,
  amount: z.coerce.number().min(0),
  method: paymentMethodSchema,
  status: paymentStatusSchema.default("pending"),
  transaction_ref: z.string().trim().min(1).nullable().optional(),
  paid_at: z.string().datetime().nullable().optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial();

export const paymentQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  status: paymentStatusSchema.or(z.literal("")).optional(),
  method: paymentMethodSchema.or(z.literal("")).optional(),
  order_id: z.string().trim().optional(),
});
