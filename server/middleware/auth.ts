import { defineEventHandler, getHeader } from "h3";
import { getSupabaseAuthUser } from "../lib/supabase";
import {
  extractBearerToken,
  getAnonymousAuthContext,
  getAuthenticatedAuthContext,
  getInvalidAuthContext,
} from "../utils/auth";
import { resolveAuthenticatedUser } from "../services/users/resolve-authenticated-user";

export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, "authorization");

  if (!authorization) {
    event.context.auth = getAnonymousAuthContext();
    return;
  }

  const token = extractBearerToken(event);

  if (!token) {
    event.context.auth = getInvalidAuthContext(
      null,
      "Authorization header must use Bearer token format",
    );
    return;
  }

  const authUser = await getSupabaseAuthUser(token);

  if (!authUser) {
    event.context.auth = getInvalidAuthContext(token);
    return;
  }

  const resolvedUser = await resolveAuthenticatedUser({
    id: authUser.id,
    email: authUser.email ?? null,
    imageUrl: authUser.user_metadata?.image_url ?? null,
    role: authUser.app_metadata?.role ?? authUser.user_metadata?.role ?? null,
    customerType:
      authUser.app_metadata?.customer_type ??
      authUser.user_metadata?.customer_type ??
      null,
  });

  event.context.auth = getAuthenticatedAuthContext({
    token,
    user: resolvedUser,
  });
});
