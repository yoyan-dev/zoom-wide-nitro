import type { User } from "../../types";
import { updateDriverAccountSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { updateManagedUser } from "../users/managed-users";

type UpdateDriverAccountParams = {
  id: unknown;
  input: unknown;
};

export async function updateDriverAccount(
  params: UpdateDriverAccountParams,
): Promise<User> {
  const parsedInput = updateDriverAccountSchema.safeParse(params.input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  return updateManagedUser({
    id: params.id,
    input: parsedInput.data,
    allowedRoles: ["driver"],
    notFoundMessage: "Driver not found",
  });
}
