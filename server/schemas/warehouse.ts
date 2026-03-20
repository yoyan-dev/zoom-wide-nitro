import { z } from "zod";
import { paginationQuerySchema, textIdSchema } from "./common";

export const warehouseStatusSchema = z.enum([
  "active",
  "inactive",
  "archived",
]);

export const createWarehouseSchema = z.object({
  name: z.string().trim().min(1).max(160),
  address: z.string().trim().min(1).max(500),
  manager_id: textIdSchema.nullable().optional(),
  capacity: z.coerce.number().int().min(0),
  status: warehouseStatusSchema.default("active"),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

export const warehouseQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  status: warehouseStatusSchema.or(z.literal("")).optional(),
});
