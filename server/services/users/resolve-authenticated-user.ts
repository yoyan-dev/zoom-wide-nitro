import type { User } from "../../types";
import { getUserByIdRecord } from "../../repositories/users/get-user-by-id";
import {
  type AuthenticatedRequestUser,
  isCustomerType,
  isUserRole,
} from "../../utils/auth";

type ResolveAuthenticatedUserInput = {
  id: string;
  email?: string | null;
  imageUrl?: string | null;
  role?: unknown;
  customer_type?: unknown;
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
      imageUrl: record.image_url ?? fallback.imageUrl ?? null,
      role: null,
      customer_type: null,
      roleSource: "none",
      isActive: false,
    };
  }

  if (isUserRole(record.role)) {
    return {
      id: record.id,
      email: resolvedEmail,
      imageUrl: record.image_url ?? fallback.imageUrl ?? null,
      role: record.role,
      customer_type: record.customer_type,
      roleSource: "users_table",
      isActive: record.is_active,
    };
  }

  return {
    id: record.id,
    email: resolvedEmail,
    imageUrl: record.image_url ?? fallback.imageUrl ?? null,
    role: null,
    customer_type: null,
    roleSource: "none",
    isActive: record.is_active,
  };
}

function mapFallbackResult(
  input: ResolveAuthenticatedUserInput,
): AuthenticatedRequestUser {
  const fallbackRole = isUserRole(input.role) ? input.role : null;
  const fallbackCustomerType = isCustomerType(input.customer_type)
    ? input.customer_type
    : null;

  return {
    id: input.id,
    email: input.email ?? null,
    imageUrl: input.imageUrl ?? null,
    role: fallbackRole,
    customer_type: fallbackCustomerType,
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
