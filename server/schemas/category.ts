import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const categorySpecHighlightSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  overview: z.string().trim().min(1).optional(),
  typical_uses: z.array(z.string().trim().min(1)).default([]),
  buying_considerations: z.array(z.string().trim().min(1)).default([]),
  featured_specs: z.array(categorySpecHighlightSchema).default([]),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
});
