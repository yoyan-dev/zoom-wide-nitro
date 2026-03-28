import { deleteManagedUser } from "../users/managed-users";

export async function deleteDriverAccount(id: unknown): Promise<void> {
  await deleteManagedUser({
    id,
    allowedRoles: ["driver"],
    notFoundMessage: "Driver not found",
  });
}
