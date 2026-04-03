import { z } from "zod";
import { paginationQuerySchema, textIdSchema } from "./common";

const optionalPostalCodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(30)
  .nullable()
  .optional();

const optionalAddressLineSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .nullable()
  .optional();

const optionalCountrySchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .nullable()
  .optional();

export const createAddressSchema = z.object({
  customer_id: textIdSchema,
  street: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(120),
  province: z.string().trim().min(1).max(120),
  postal_code: optionalPostalCodeSchema,
  country: optionalCountrySchema,
  address_line: optionalAddressLineSchema,
});

export const updateAddressSchema = createAddressSchema
  .omit({ customer_id: true })
  .partial();

export const addressQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
});
