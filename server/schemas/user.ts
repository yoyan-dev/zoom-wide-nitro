import { z } from "zod";

const managedUserAccountSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  full_name: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(1).max(60).nullable().optional(),
  image_url: z.string().trim().url().nullable().optional(),
});

const managedUserAccountUpdateSchema = z.object({
  email: z.string().trim().email().optional(),
  password: z.string().min(8).max(128).optional(),
  full_name: z.string().trim().min(1).max(160).optional(),
  phone: z.string().trim().min(1).max(60).nullable().optional(),
  image_url: z.string().trim().url().nullable().optional(),
  is_active: z.boolean().optional(),
});

export const INTERNAL_USER_ROLES = [
  "admin",
  "manager",
  "staff",
  "warehouse_manager",
  "finance",
  "supplier",
  "auditor",
 ] as const;

export const internalUserRoleSchema = z.enum(INTERNAL_USER_ROLES);

export const createInternalUserSchema = managedUserAccountSchema.extend({
  role: internalUserRoleSchema,
});

export const updateInternalUserSchema = managedUserAccountUpdateSchema.extend({
  role: internalUserRoleSchema.optional(),
});
