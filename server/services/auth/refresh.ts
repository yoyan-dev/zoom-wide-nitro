import type { AuthResponseData } from "../../types";
import { mapSupabaseSession, refreshSupabaseSession } from "../../lib/supabase";
import { refreshSessionSchema } from "../../schemas";
import {
  badRequestError,
  forbiddenError,
  unauthorizedError,
} from "../../utils/errors";
import { resolveAuthenticatedUser } from "../users/resolve-authenticated-user";
import { buildAuthResponseData } from "./map-auth-response";

function isInvalidRefreshError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("refresh token") ||
    message.includes("invalid grant") ||
    message.includes("session not found")
  );
}

export async function refreshAuthSession(
  input: unknown,
): Promise<AuthResponseData> {
  const parsedInput = refreshSessionSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const { data, error } = await refreshSupabaseSession(
    parsedInput.data.refresh_token,
  );

  if (error || !data.user || !data.session) {
    if (isInvalidRefreshError(error)) {
      throw unauthorizedError("Invalid or expired refresh token");
    }

    throw unauthorizedError(error?.message ?? "Unable to refresh session");
  }

  const resolvedUser = await resolveAuthenticatedUser({
    id: data.user.id,
    email: data.user.email ?? data.session.user.email ?? null,
    role:
      data.user.app_metadata?.role ??
      data.user.user_metadata?.role ??
      data.session.user.app_metadata?.role ??
      data.session.user.user_metadata?.role ??
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
