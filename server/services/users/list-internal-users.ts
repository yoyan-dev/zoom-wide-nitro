import type { PaginatedResult, User } from "../../types";
import { INTERNAL_USER_ROLES } from "../../schemas";
import { listManagedUsers, type ListManagedUsersParams } from "./managed-users";

type ListInternalUsersParams = Omit<ListManagedUsersParams, "roles">;

export async function listInternalUsers(
  params: ListInternalUsersParams,
): Promise<PaginatedResult<User[]>> {
  return listManagedUsers({
    ...params,
    roles: INTERNAL_USER_ROLES,
  });
}
