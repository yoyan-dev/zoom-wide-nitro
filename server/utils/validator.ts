// server/utils/validate.ts
import { readBody } from "h3";
import type { ZodSchema } from "zod";

export async function validateBody<T>(event: any, schema: ZodSchema<T>) {
  const body = await readBody(event);
  return schema.safeParse(body);
}
