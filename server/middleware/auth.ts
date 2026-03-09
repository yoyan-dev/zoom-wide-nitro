import { createError, defineEventHandler, getHeader, type H3Event } from "h3";
import { findUserById } from "../repositories/user.repo";
import type { AuthContext } from "../types";
import { getSupabaseClient } from "../utils/supabase";

function parseBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export async function authenticate(
  event: H3Event,
  options: { required?: boolean } = {}
): Promise<AuthContext | null> {
  if (event.context.auth) {
    return event.context.auth;
  }

  const { required = true } = options;
  const token = parseBearerToken(getHeader(event, "authorization"));

  if (!token) {
    if (required) {
      throw createError({
        statusCode: 401,
        statusMessage: "Missing or invalid Authorization header.",
      });
    }
    return null;
  }

  const supabase = getSupabaseClient(event);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid or expired JWT.",
    });
  }

  const profile = await findUserById(supabase, data.user.id);
  const authContext: AuthContext = {
    token,
    supabaseUser: data.user,
    profile,
  };

  event.context.auth = authContext;
  return authContext;
}

export async function requireAuth(event: H3Event): Promise<AuthContext> {
  const authContext = await authenticate(event, { required: true });
  if (!authContext) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized.",
    });
  }

  return authContext;
}

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith("/api")) {
    return;
  }

  const authorizationHeader = getHeader(event, "authorization");
  if (!authorizationHeader) {
    return;
  }

  await authenticate(event, { required: true });
});
