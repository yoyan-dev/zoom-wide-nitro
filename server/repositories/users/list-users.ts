import type { User, UserRole } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { USER_SELECT } from "./user-select";

export type ListUserRecordsParams = {
  q?: string;
  roles?: readonly UserRole[];
  from: number;
  to: number;
};

export async function listUserRecords(
  params: ListUserRecordsParams,
): Promise<RepositoryListResult<User>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("users")
    .select(USER_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (params.roles?.length) {
    query = query.in("role", [...params.roles]);
  }

  if (params.q) {
    query = query.or(
      [
        `email.ilike.%${params.q}%`,
        `full_name.ilike.%${params.q}%`,
        `phone.ilike.%${params.q}%`,
        `role.ilike.%${params.q}%`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as User[],
    count,
  });
}
