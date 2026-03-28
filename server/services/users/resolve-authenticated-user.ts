import type { User } from "../../types";
import { getUserByIdRecord } from "../../repositories/users/get-user-by-id";
import { type AuthenticatedRequestUser, isUserRole } from "../../utils/auth";

type ResolveAuthenticatedUserInput = {
  id: string;
  email?: string | null;
  role?: unknown;
};

function mapUserTableResult(
  record: User,
  fallback: ResolveAuthenticatedUserInput,
): AuthenticatedRequestUser {
  const resolvedEmail = record.email ?? fallback.email ?? null;

  if (record.is_active === false) {
    return {
      id: record.id,
      email: resolvedEmail,
      role: null,
      roleSource: "none",
      isActive: false,
    };
  }

  if (isUserRole(record.role)) {
    return {
      id: record.id,
      email: resolvedEmail,
      role: record.role,
      roleSource: "users_table",
      isActive: record.is_active,
    };
  }

  return {
    id: record.id,
    email: resolvedEmail,
    role: null,
    roleSource: "none",
    isActive: record.is_active,
  };
}

function mapFallbackResult(
  input: ResolveAuthenticatedUserInput,
): AuthenticatedRequestUser {
  const fallbackRole = isUserRole(input.role) ? input.role : null;

  return {
    id: input.id,
    email: input.email ?? null,
    role: fallbackRole,
    roleSource: fallbackRole ? "auth_metadata" : "none",
    isActive: null,
  };
}

export async function resolveAuthenticatedUser(
  input: ResolveAuthenticatedUserInput,
): Promise<AuthenticatedRequestUser> {
  try {
    const userRecord = await getUserByIdRecord(input.id);

    if (!userRecord) {
      return mapFallbackResult(input);
    }

    return mapUserTableResult(userRecord, input);
  } catch {
    return mapFallbackResult(input);
  }
}
