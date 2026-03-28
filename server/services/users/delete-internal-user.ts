import { INTERNAL_USER_ROLES } from "../../schemas";
import { deleteManagedUser } from "./managed-users";

export async function deleteInternalUser(id: unknown): Promise<void> {
  await deleteManagedUser({
    id,
    allowedRoles: INTERNAL_USER_ROLES,
    notFoundMessage: "User not found",
  });
}
