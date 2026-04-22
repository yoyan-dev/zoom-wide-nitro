import type { AuthResponseData } from "../../types";
import { mapSupabaseSession, signInWithPassword } from "../../lib/supabase";
import { loginSchema } from "../../schemas";
import {
  forbiddenError,
  unauthorizedError,
  badRequestError,
} from "../../utils/errors";
import { resolveAuthenticatedUser } from "../users/resolve-authenticated-user";
import { buildAuthResponseData } from "./map-auth-response";

function isInvalidLoginError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials") ||
    message.includes("email not confirmed")
  );
}

export async function login(input: unknown): Promise<AuthResponseData> {
  const parsedInput = loginSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const { data, error } = await signInWithPassword(parsedInput.data);

  if (error || !data.user || !data.session) {
    if (isInvalidLoginError(error)) {
      throw unauthorizedError("Invalid email or password");
    }

    throw unauthorizedError(error?.message ?? "Unable to sign in");
  }

  const resolvedUser = await resolveAuthenticatedUser({
    id: data.user.id,
    email: data.user.email ?? parsedInput.data.email,
    imageUrl: data.user.user_metadata?.image_url ?? null,
    role: data.user.app_metadata?.role ?? data.user.user_metadata?.role ?? null,
    customer_type:
      data.user.app_metadata?.customer_type ??
      data.user.user_metadata?.customer_type ??
      null,
  });

  if (resolvedUser.isActive === false) {
    throw forbiddenError("User account is inactive");
  }

  return buildAuthResponseData({
    user: resolvedUser,
    session: mapSupabaseSession(data.session),
  });
}
