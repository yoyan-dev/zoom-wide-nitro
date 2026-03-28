import type { User } from "../../types";
import { INTERNAL_USER_ROLES, updateInternalUserSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { updateManagedUser } from "./managed-users";

type UpdateInternalUserParams = {
  id: unknown;
  input: unknown;
};

export async function updateInternalUser(
  params: UpdateInternalUserParams,
): Promise<User> {
  const parsedInput = updateInternalUserSchema.safeParse(params.input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  return updateManagedUser({
    id: params.id,
    input: parsedInput.data,
    allowedRoles: INTERNAL_USER_ROLES,
    notFoundMessage: "User not found",
  });
}
