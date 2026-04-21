import { z } from "zod";

const registerRoleSchema = z.enum(["customer", "driver"]);
const customerTypeSchema = z.enum(["contractor", "regular"]);

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

export const changePasswordSchema = z.object({
  current_password: z.string().min(8).max(128),
  new_password: z.string().min(8).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
  redirect_to: z.string().trim().url().optional(),
});

export const registerAccountSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(8).max(128),
    role: registerRoleSchema,
    customer_type: customerTypeSchema.optional(),
    company_name: z.string().trim().min(1).max(160).optional(),
    contact_name: z.string().trim().min(1).max(160),
    phone: z.string().trim().min(1).max(60).nullable().optional(),
    image_url: z.string().trim().url().nullable().optional(),
    billing_address: z.string().trim().min(1).max(500).nullable().optional(),
    shipping_address: z.string().trim().min(1).max(500).nullable().optional(),
  })
  .superRefine((input, ctx) => {
    if (input.role === "customer" && !input.customer_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customer_type"],
        message: "customer_type is required",
      });
    }

    if (input.role !== "customer" && input.customer_type !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customer_type"],
        message: "customer_type is only allowed for customer accounts",
      });
    }

    if (input.role === "customer" && !input.company_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["company_name"],
        message: "company_name is required",
      });
    }
  });
