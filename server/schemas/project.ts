import { z } from "zod";
import { textIdSchema } from "./common";

const dateStringSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/);

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(160),
  location: z.string().trim().min(1).max(500).nullable().optional(),
  description: z.string().trim().min(1).max(2000).nullable().optional(),
  start_date: dateStringSchema.nullable().optional(),
  end_date: dateStringSchema.nullable().optional(),
  status: z
    .enum(["active", "completed", "on_hold", "cancelled"])
    .default("active"),
  progress: z.number().min(0).max(100).nullable().optional(),
  budget: z.coerce.number().min(0).nullable().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createProjectItemSchema = z.object({
  product_id: textIdSchema,
  quantity: z.coerce.number().positive(),
  unit_price: z.coerce.number().min(0).optional(),
});

export const updateProjectItemSchema = z.object({
  quantity: z.coerce.number().positive(),
});
