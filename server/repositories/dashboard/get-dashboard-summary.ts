import type { DashboardSummary } from "../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export type DashboardBaseCountsRecord = Pick<
  DashboardSummary,
  "totalCategories" | "totalCustomers"
>;

async function countTableRecords(table: string): Promise<number> {
  const supabase = useRepositoryClient();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  ensureRepositorySuccess(error);
  return count ?? 0;
}

export async function getDashboardBaseCountsRecord(): Promise<DashboardBaseCountsRecord> {
  const [totalCategories, totalCustomers] = await Promise.all([
    countTableRecords("categories"),
    countTableRecords("customers"),
  ]);

  return {
    totalCategories,
    totalCustomers,
  };
}
