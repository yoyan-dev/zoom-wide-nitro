import { readBody, type H3Event } from "h3";
import type { ZodSchema } from "zod";
import { badRequestError } from "./errors";

function normalizeValue(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

export async function validateBody<T>(event: H3Event, schema: ZodSchema<T>) {
  const body = await readBody(event);
  const parsedBody = schema.safeParse(body);

  if (!parsedBody.success) {
    throw badRequestError(parsedBody.error.message);
  }

  return parsedBody.data;
}

export function required<T>(value: T | null | undefined, field: string): T {
  const normalized = normalizeValue(value);

  if (normalized === undefined || normalized === null || normalized === "") {
    throw badRequestError(`${field} is required`);
  }

  return normalized as T;
}

export function optional<T, TResult = T>(
  value: T | null | undefined,
  transform?: (value: T) => TResult,
): TResult | undefined {
  const normalized = normalizeValue(value);

  if (normalized === undefined || normalized === null || normalized === "") {
    return undefined;
  }

  return transform
    ? transform(normalized as T)
    : ((normalized as unknown) as TResult);
}

export function string(value: unknown, field: string): string {
  const normalized = required(value, field);

  if (typeof normalized !== "string") {
    throw badRequestError(`${field} must be a string`);
  }

  const trimmedValue = normalized.trim();

  if (trimmedValue.length === 0) {
    throw badRequestError(`${field} must be a non-empty string`);
  }

  return trimmedValue;
}

export function number(value: unknown, field: string): number {
  const normalized = required(value, field);
  const parsedValue =
    typeof normalized === "number" ? normalized : Number(normalized);

  if (!Number.isFinite(parsedValue)) {
    throw badRequestError(`${field} must be a valid number`);
  }

  return parsedValue;
}
