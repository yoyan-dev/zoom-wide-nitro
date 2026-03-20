import { defineEventHandler, getQuery, setResponseStatus } from "h3";
import type { InventoryLog } from "../../../shared/types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { inventoryQuerySchema } from "../../schemas";
import { getPagination } from "../../utils/pagination";
import { badRequest, internalError, ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const parsedQuery = inventoryQuerySchema.safeParse(getQuery(event));

  if (!parsedQuery.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedQuery.error.message);
  }

  const { q, movement_type, product_id, page, limit } = parsedQuery.data;
  const { from, to } = getPagination({ page, limit });
  const supabase = getSupabaseAdmin();

  const [logsResult, productsResult] = await Promise.all([
    supabase.from("inventory_logs").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("id, name, sku"),
  ]);

  if (logsResult.error) {
    setResponseStatus(event, 500);
    return internalError(logsResult.error.message);
  }

  if (productsResult.error) {
    setResponseStatus(event, 500);
    return internalError(productsResult.error.message);
  }

  const productMap = new Map(
    (productsResult.data ?? []).map((product) => [
      product.id,
      { name: product.name ?? "", sku: product.sku ?? "" },
    ]),
  );

  let logs = (logsResult.data ?? []).map(
    (item) =>
      ({
        id: item.id,
        product_id: item.product_id,
        movement_type: item.movement_type,
        quantity_change: item.quantity_change,
        reference_type: item.reference_type,
        reference_id: item.reference_id,
        note: item.note,
        created_by: item.created_by,
        created_at: item.created_at,
      }) satisfies InventoryLog,
  );

  if (movement_type) {
    logs = logs.filter((log) => log.movement_type === movement_type);
  }

  if (product_id) {
    logs = logs.filter((log) => log.product_id === product_id);
  }

  if (q) {
    const term = q.trim().toLowerCase();
    logs = logs.filter((log) => {
      const product = productMap.get(log.product_id);
      return [
        log.id,
        log.product_id,
        log.note ?? "",
        log.reference_type ?? "",
        log.reference_id ?? "",
        product?.name ?? "",
        product?.sku ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }

  return ok(logs.slice(from, to + 1), {
    total: logs.length,
  });
});
