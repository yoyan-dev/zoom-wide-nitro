import {
  defineEventHandler,
  getQuery,
  setResponseStatus,
} from "h3";
import type { Category } from "../../../shared/types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { categoryQuerySchema } from "../../schemas";
import { getPagination } from "../../utils/pagination";
import { badRequest, internalError, ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const parsedQuery = categoryQuerySchema.safeParse(getQuery(event));

  if (!parsedQuery.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedQuery.error.message);
  }

  const { q, page, limit } = parsedQuery.data;
  const { from, to } = getPagination({ page, limit });
  const supabase = getSupabaseAdmin();
  const mapCategory = (row: any): Category => ({
    ...row,
    overview: row.overview ?? undefined,
  });

  if (q) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setResponseStatus(event, 500);
      return internalError(error.message);
    }

    const term = q.trim().toLowerCase();
    const filtered = (data ?? []).filter((category) =>
      [
        category.id,
        category.name,
        category.description ?? "",
        category.image_url ?? "",
        category.overview ?? "",
        ...((category.typical_uses as string[] | null) ?? []),
        ...((category.buying_considerations as string[] | null) ?? []),
        ...(((category.featured_specs as Array<{ label?: string; value?: string }> | null) ?? []).flatMap((item) => [
          item.label ?? "",
          item.value ?? "",
        ])),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );

    return ok(
      filtered.slice(from, to + 1).map(mapCategory),
      {
        total: filtered.length,
      },
    );
  }

  const { data, error, count } = await supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  return ok((data ?? []).map(mapCategory), {
    total: count ?? 0,
  });
});
