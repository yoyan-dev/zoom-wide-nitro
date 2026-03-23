import { z } from "zod";
import { paginationQuerySchema, textIdSchema } from "./common";

export const inventoryMovementTypeSchema = z.enum(["in", "out", "adjustment"]);

const inventoryLogSchemaFields = z.object({
  product_id: textIdSchema,
  movement_type: inventoryMovementTypeSchema,
  quantity_change: z.coerce.number(),
  reference_type: z.string().trim().min(1).nullable().optional(),
  reference_id: z.string().trim().min(1).nullable().optional(),
  note: z.string().trim().max(2000).nullable().optional(),
  created_by: textIdSchema.nullable().optional(),
});

function applyInventoryLogRules(
  data: z.infer<typeof inventoryLogSchemaFields>,
  ctx: z.RefinementCtx,
) {
  const hasReferenceType = Boolean(data.reference_type);
  const hasReferenceId = Boolean(data.reference_id);

  if (hasReferenceType !== hasReferenceId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: hasReferenceType ? ["reference_id"] : ["reference_type"],
      message: "reference_type and reference_id must be provided together",
    });
  }

  if (data.movement_type === undefined || data.quantity_change === undefined) {
    return;
  }

  if (data.movement_type === "adjustment") {
    if (data.quantity_change < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantity_change"],
        message: "quantity_change must be zero or greater for adjustment",
      });
    }

    return;
  }

  if (data.quantity_change <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["quantity_change"],
      message: "quantity_change must be greater than zero",
    });
  }
}

export const createInventoryLogSchema = inventoryLogSchemaFields.superRefine(
  applyInventoryLogRules,
);

export const updateInventoryLogSchema = inventoryLogSchemaFields
  .partial()
  .superRefine(applyInventoryLogRules);

export const inventoryQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  movement_type: inventoryMovementTypeSchema.or(z.literal("")).optional(),
  product_id: z.string().trim().optional(),
});
