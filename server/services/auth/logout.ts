import type { AuthLogoutResponseData } from "../../types";
import { signOutSupabaseSession } from "../../lib/supabase";
import { logoutSchema } from "../../schemas";
import { badRequestError, unauthorizedError } from "../../utils/errors";

export async function logout(input: {
  accessToken: string | null;
  body: unknown;
}): Promise<AuthLogoutResponseData> {
  const parsedBody = logoutSchema.safeParse(input.body);

  if (!parsedBody.success) {
    throw badRequestError(parsedBody.error.message);
  }

  if (!input.accessToken) {
    throw unauthorizedError(
      "Authorization header with Bearer token is required",
    );
  }

  const scope = parsedBody.data.scope ?? "local";
  const { error } = await signOutSupabaseSession({
    accessToken: input.accessToken,
    refreshToken: parsedBody.data.refresh_token,
    scope,
  });

  if (error) {
    throw unauthorizedError(error.message ?? "Unable to sign out");
  }

  return {
    signed_out: true,
    scope,
  };
}
