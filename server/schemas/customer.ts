import { z } from "zod";
import { paginationQuerySchema, textIdSchema } from "./common";

export const createCustomerSchema = z.object({
  user_id: textIdSchema.nullable().optional(),
  company_name: z.string().trim().min(1).max(160),
  contact_name: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(1).max(60).nullable().optional(),
  email: z.string().trim().email(),
  image_url: z.string().trim().url().nullable().optional(),
  billing_address: z.string().trim().min(1).max(500).nullable().optional(),
  shipping_address: z.string().trim().min(1).max(500).nullable().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
});
