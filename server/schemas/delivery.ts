import { z } from "zod";
import { paginationQuerySchema, textIdSchema } from "./common";

export const deliveryStatusSchema = z.enum([
  "scheduled",
  "in_transit",
  "delivered",
  "failed",
  "cancelled",
]);

export const createDeliverySchema = z.object({
  order_id: textIdSchema,
  driver_id: textIdSchema.nullable().optional(),
  vehicle_number: z.string().trim().min(1).max(60).nullable().optional(),
  status: deliveryStatusSchema.default("scheduled"),
  scheduled_at: z.string().datetime().nullable().optional(),
  delivered_at: z.string().datetime().nullable().optional(),
});

export const updateDeliverySchema = createDeliverySchema.partial();

export const deliveryQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  status: deliveryStatusSchema.or(z.literal("")).optional(),
  order_id: z.string().trim().optional(),
  driver_id: z.string().trim().optional(),
});
