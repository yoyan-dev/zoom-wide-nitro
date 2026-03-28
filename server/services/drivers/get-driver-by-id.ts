import type { User } from "../../types";
import { getManagedUserById } from "../users/managed-users";

export async function getDriverById(id: unknown): Promise<User> {
  return getManagedUserById({
    id,
    allowedRoles: ["driver"],
    notFoundMessage: "Driver not found",
  });
}
