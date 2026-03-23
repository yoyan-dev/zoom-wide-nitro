import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1).max(160),
  contact_name: z.string().trim().min(1).max(160).optional(),
  phone: z.string().trim().min(1).max(60).optional(),
  email: z.string().trim().email().optional(),
  address: z.string().trim().min(1).max(500).optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const supplierQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
});
