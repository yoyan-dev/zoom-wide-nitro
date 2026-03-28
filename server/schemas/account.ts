import { z } from "zod";

export const updateOwnAccountSchema = z.object({
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(1).max(60).nullable().optional(),
  image_url: z.string().trim().url().nullable().optional(),
  full_name: z.string().trim().min(1).max(160).optional(),
  name: z.string().trim().min(1).max(160).optional(),
  contact_name: z.string().trim().min(1).max(160).optional(),
  company_name: z.string().trim().min(1).max(160).optional(),
  billing_address: z.string().trim().min(1).max(500).nullable().optional(),
  shipping_address: z.string().trim().min(1).max(500).nullable().optional(),
  license_number: z.string().trim().min(1).max(120).nullable().optional(),
  vehicle_number: z.string().trim().min(1).max(120).nullable().optional(),
});
