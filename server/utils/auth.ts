import { getHeader, type H3Event } from "h3";
import type { UserRole } from "../../types/user";

export type RequestUser = {
  id: string;
  role: UserRole | null;
  email: string | null;
};

export function getRequestUser(event: H3Event): RequestUser | null {
  const id = getHeader(event, "x-user-id");

  if (!id) {
    return null;
  }

  const roleHeader = getHeader(event, "x-user-role");
  const email = getHeader(event, "x-user-email") ?? null;

  return {
    id,
    role: (roleHeader as UserRole | null) ?? null,
    email,
  };
}

export function requireRequestUser(event: H3Event): RequestUser {
  const user = getRequestUser(event);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
