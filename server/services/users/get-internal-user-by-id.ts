import type { User } from "../../types";
import { INTERNAL_USER_ROLES } from "../../schemas";
import { getManagedUserById } from "./managed-users";

export async function getInternalUserById(id: unknown): Promise<User> {
  return getManagedUserById({
    id,
    allowedRoles: INTERNAL_USER_ROLES,
    notFoundMessage: "User not found",
  });
}
