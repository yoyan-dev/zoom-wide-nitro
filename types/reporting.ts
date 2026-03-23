import type { PaginationMeta } from "./pagination";

export type DateRangeFilter = {
  from?: string;
  to?: string;
};

export type SortDirection = "asc" | "desc";

export type SortFilter<TField extends string = string> = {
  sortBy?: TField;
  sortDirection?: SortDirection;
};

export type ReportPagination = {
  page: number;
  limit: number;
};

export type ReportQuery<TField extends string = string> = DateRangeFilter
  & SortFilter<TField>
  & ReportPagination;

export type NumericSummary = Record<string, number>;

export type SummaryResponse<TSummary extends NumericSummary = NumericSummary> = {
  summary: TSummary;
  meta?: PaginationMeta;
};
