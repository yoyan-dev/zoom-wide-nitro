import { z } from "zod";
import { paginationQuerySchema, textIdSchema } from "./common";

export const inventoryMovementTypeSchema = z.enum(["in", "out", "adjustment"]);

export const createInventoryLogSchema = z.object({
  product_id: textIdSchema,
  movement_type: inventoryMovementTypeSchema,
  quantity_change: z.coerce.number().positive({
    message: "quantity_change must be greater than zero",
  }),
  reference_type: z.string().trim().min(1).nullable().optional(),
  reference_id: z.string().trim().min(1).nullable().optional(),
  note: z.string().trim().max(2000).nullable().optional(),
  created_by: textIdSchema.nullable().optional(),
});

export const updateInventoryLogSchema = createInventoryLogSchema.partial();

export const inventoryQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  movement_type: inventoryMovementTypeSchema.or(z.literal("")).optional(),
  product_id: z.string().trim().optional(),
});
