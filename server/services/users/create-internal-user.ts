import type { User } from "../../types";
import { createInternalUserSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { createManagedUserAccount } from "./create-managed-user-account";

export async function createInternalUser(input: unknown): Promise<User> {
  const parsedInput = createInternalUserSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  return createManagedUserAccount(parsedInput.data);
}
