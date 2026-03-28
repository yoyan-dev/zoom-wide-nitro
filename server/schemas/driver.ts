import { z } from "zod";

export const createDriverSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(1).max(60).nullable().optional(),
  image_url: z.string().trim().url().nullable().optional(),
  license_number: z.string().trim().min(1).max(120).nullable().optional(),
  vehicle_number: z.string().trim().min(1).max(120).nullable().optional(),
});

export const updateDriverSchema = z.object({
  email: z.string().trim().email().optional(),
  password: z.string().min(8).max(128).optional(),
  name: z.string().trim().min(1).max(160).optional(),
  phone: z.string().trim().min(1).max(60).nullable().optional(),
  image_url: z.string().trim().url().nullable().optional(),
  license_number: z.string().trim().min(1).max(120).nullable().optional(),
  vehicle_number: z.string().trim().min(1).max(120).nullable().optional(),
  is_active: z.boolean().optional(),
});
