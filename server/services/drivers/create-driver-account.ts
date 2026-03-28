import type { User } from "../../types";
import { createDriverAccountSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { createManagedUserAccount } from "../users/create-managed-user-account";

export async function createDriverAccount(input: unknown): Promise<User> {
  const parsedInput = createDriverAccountSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  return createManagedUserAccount({
    ...parsedInput.data,
    role: "driver",
  });
}
