import { getHeader, type H3Event } from "h3";
import type { CustomerType, UserRole } from "../types/user";
import { unauthorizedError } from "./errors";

export type AuthenticatedRequestUser = {
  id: string;
  role: UserRole | null;
  customer_type: CustomerType | null;
  email: string | null;
  imageUrl: string | null;
  roleSource: "users_table" | "auth_metadata" | "none";
  isActive: boolean | null;
};

export type RequestAuthContext = {
  token: string | null;
  user: AuthenticatedRequestUser | null;
  status: "anonymous" | "authenticated" | "invalid";
  error: string | null;
};

const USER_ROLES: UserRole[] = ["admin", "customer", "driver", "supplier"];

const CUSTOMER_TYPES: CustomerType[] = ["contractor", "regular"];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function isCustomerType(value: unknown): value is CustomerType {
  return (
    typeof value === "string" && CUSTOMER_TYPES.includes(value as CustomerType)
  );
}

export function extractBearerToken(event: H3Event): string | null {
  const authorization = getHeader(event, "authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token?.trim()) {
    return null;
  }

  return token.trim();
}

export function getAnonymousAuthContext(): RequestAuthContext {
  return {
    token: null,
    user: null,
    status: "anonymous",
    error: null,
  };
}

export function getInvalidAuthContext(
  token: string | null,
  message = "Invalid authentication token",
): RequestAuthContext {
  return {
    token,
    user: null,
    status: "invalid",
    error: message,
  };
}

export function getAuthenticatedAuthContext(input: {
  token: string;
  user: AuthenticatedRequestUser;
}): RequestAuthContext {
  return {
    token: input.token,
    user: input.user,
    status: "authenticated",
    error: null,
  };
}

export function getRequestAuth(event: H3Event): RequestAuthContext {
  return event.context.auth ?? getAnonymousAuthContext();
}

export function getRequestUser(
  event: H3Event,
): AuthenticatedRequestUser | null {
  return getRequestAuth(event).user;
}

export function requireRequestUser(event: H3Event): AuthenticatedRequestUser {
  const auth = getRequestAuth(event);

  if (auth.status === "invalid") {
    throw unauthorizedError(auth.error ?? "Invalid authentication token");
  }

  if (!auth.user) {
    throw unauthorizedError("Authentication required");
  }

  return auth.user;
}
