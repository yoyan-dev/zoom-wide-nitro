import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const refreshSessionSchema = z.object({
  refresh_token: z.string().trim().min(1).max(2048),
});

export const logoutSchema = z.object({
  refresh_token: z.string().trim().min(1).max(2048),
  scope: z.enum(["global", "local", "others"]).optional(),
});

export const registerCustomerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  company_name: z.string().trim().min(1).max(160),
  contact_name: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(1).max(60).nullable().optional(),
  billing_address: z.string().trim().min(1).max(500).nullable().optional(),
  shipping_address: z.string().trim().min(1).max(500).nullable().optional(),
});
