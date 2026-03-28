import type { PaginatedResult, User } from "../../types";
import {
  listManagedUsers,
  type ListManagedUsersParams,
} from "../users/managed-users";

type ListDriversParams = Omit<ListManagedUsersParams, "roles">;

export async function listDrivers(
  params: ListDriversParams,
): Promise<PaginatedResult<User[]>> {
  return listManagedUsers({
    ...params,
    roles: ["driver"],
  });
}
