import type { H3Event } from "h3";
import type {
  DateRangeFilter,
  NumericSummary,
  ReportPagination,
  SortDirection,
  SortFilter,
  SummaryResponse,
} from "../../types";
import { badRequestError } from "./errors";
import { parseQuery } from "./query";
import { getPagination, type PaginationInput } from "./pagination";
import { number, optional, string } from "./validator";

function isDateOnlyValue(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseDatePart(
  value: unknown,
  field: string,
  boundary: "start" | "end",
): string | undefined {
  return optional(value, (current) => {
    const parsedValue = string(current, field);
    const normalizedValue = isDateOnlyValue(parsedValue)
      ? `${parsedValue}${boundary === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z"}`
      : parsedValue;
    const timestamp = Date.parse(normalizedValue);

    if (Number.isNaN(timestamp)) {
      throw badRequestError(`${field} must be a valid date`);
    }

    return new Date(timestamp).toISOString();
  });
}

export function parseDateRange(
  event: H3Event,
  fields: { from?: string; to?: string } = {},
): DateRangeFilter {
  const fromField = fields.from ?? "from";
  const toField = fields.to ?? "to";

  const query = parseQuery(event, {
    [fromField]: (value: unknown) => parseDatePart(value, fromField, "start"),
    [toField]: (value: unknown) => parseDatePart(value, toField, "end"),
  }) as Record<string, string | undefined>;

  const from = query[fromField];
  const to = query[toField];

  if (from && to && new Date(from).getTime() > new Date(to).getTime()) {
    throw badRequestError(`${fromField} must be earlier than or equal to ${toField}`);
  }

  return {
    from,
    to,
  };
}

export function parseReportPagination(
  event: H3Event,
  options?: Omit<PaginationInput, "page" | "limit">,
): ReportPagination {
  const query = parseQuery(event, {
    page: (value) => optional(value, (current) => number(current, "page")),
    limit: (value) => optional(value, (current) => number(current, "limit")),
  });

  const pagination = getPagination({
    page: query.page,
    limit: query.limit,
    defaultLimit: options?.defaultLimit,
    maxLimit: options?.maxLimit,
  });

  return {
    page: pagination.page,
    limit: pagination.limit,
  };
}

export function normalizeReportLimit(
  limit: number | undefined,
  defaults: {
    defaultLimit?: number;
    maxLimit?: number;
    fieldName?: string;
  } = {},
): number {
  const defaultLimit = defaults.defaultLimit ?? 5;
  const maxLimit = defaults.maxLimit ?? 20;
  const fieldName = defaults.fieldName ?? "limit";

  if (limit === undefined) {
    return defaultLimit;
  }

  if (!Number.isFinite(limit) || limit < 1) {
    throw badRequestError(`${fieldName} must be a positive number`);
  }

  return Math.min(Math.trunc(limit), maxLimit);
}

export function parseStatusFilter<TStatus extends string>(
  event: H3Event,
  allowedStatuses: readonly TStatus[],
  field = "status",
): TStatus | undefined {
  const query = parseQuery(event, {
    [field]: (value: unknown) => optional(value, (current) => string(current, field)),
  }) as Record<string, string | undefined>;

  const status = query[field];

  if (!status) {
    return undefined;
  }

  if (!allowedStatuses.includes(status as TStatus)) {
    throw badRequestError(`${field} must be one of: ${allowedStatuses.join(", ")}`);
  }

  return status as TStatus;
}

export function parseSortFilter<TField extends string>(
  event: H3Event,
  allowedFields: readonly TField[],
  defaults?: {
    field?: TField;
    direction?: SortDirection;
    fieldName?: string;
    directionName?: string;
  },
): SortFilter<TField> {
  const fieldName = defaults?.fieldName ?? "sort_by";
  const directionName = defaults?.directionName ?? "sort_direction";

  const query = parseQuery(event, {
    [fieldName]: (value: unknown) => optional(value, (current) => string(current, fieldName)),
    [directionName]: (value: unknown) =>
      optional(value, (current) => string(current, directionName).toLowerCase()),
  }) as Record<string, string | undefined>;

  const sortBy = query[fieldName] ?? defaults?.field;
  const sortDirection = (query[directionName] ?? defaults?.direction) as
    | SortDirection
    | undefined;

  if (sortBy && !allowedFields.includes(sortBy as TField)) {
    throw badRequestError(`${fieldName} must be one of: ${allowedFields.join(", ")}`);
  }

  if (sortDirection && sortDirection !== "asc" && sortDirection !== "desc") {
    throw badRequestError(`${directionName} must be either asc or desc`);
  }

  return {
    sortBy: sortBy as TField | undefined,
    sortDirection,
  };
}

export function buildSummaryResponse<TSummary extends NumericSummary>(
  summary: TSummary,
): SummaryResponse<TSummary> {
  return {
    summary,
  };
}
