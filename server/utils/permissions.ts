import type { H3Event } from "h3";
import type { UserRole } from "../types";
import type { AuthenticatedRequestUser } from "./auth";
import { requireRequestUser } from "./auth";
import { forbiddenError } from "./errors";

const PERMISSION_MATRIX = {
  "categories:read": [
    "admin",
    "manager",
    "staff",
    "customer",
    "warehouse_manager",
    "finance",
    "supplier",
    "auditor",
  ],
  "categories:write": ["admin", "manager"],
  "suppliers:read": [
    "admin",
    "manager",
    "staff",
    "warehouse_manager",
    "finance",
    "supplier",
    "auditor",
  ],
  "suppliers:write": ["admin", "manager"],
  "products:read": [
    "admin",
    "manager",
    "staff",
    "customer",
    "warehouse_manager",
    "finance",
    "supplier",
    "auditor",
  ],
  "products:write": ["admin", "manager", "warehouse_manager"],
  "products:insights": ["admin", "manager", "warehouse_manager"],
  "customers:read": ["admin", "manager", "staff", "finance", "auditor"],
  "customers:write": ["admin", "manager", "staff"],
  "cart:read": ["admin", "manager", "staff", "customer", "auditor"],
  "cart:write": ["admin", "manager", "staff", "customer"],
  "orders:read": [
    "admin",
    "manager",
    "staff",
    "warehouse_manager",
    "finance",
    "driver",
    "auditor",
  ],
  "orders:report": ["admin", "manager", "staff", "finance", "auditor"],
  "orders:write": ["admin", "manager", "staff"],
  "orders:review": ["admin", "manager"],
  "deliveries:read": [
    "admin",
    "manager",
    "staff",
    "warehouse_manager",
    "finance",
    "auditor",
  ],
  "deliveries:report": ["admin", "manager", "staff", "auditor"],
  "deliveries:write": ["admin", "manager"],
  "deliveries:status": ["admin", "manager", "driver"],
  "inventory:read": [
    "admin",
    "manager",
    "staff",
    "warehouse_manager",
    "finance",
    "auditor",
  ],
  "inventory:report": ["admin", "manager", "warehouse_manager", "auditor"],
  "inventory:write": ["admin", "manager", "warehouse_manager"],
  "payments:read": ["admin", "manager", "finance", "auditor"],
  "payments:report": ["admin", "finance", "auditor"],
  "payments:write": ["admin", "finance"],
  "payments:status": ["admin", "finance"],
  "dashboard:read": ["admin", "manager"],
  "admin:ops": ["admin"],
} as const satisfies Record<string, readonly UserRole[]>;

export type PermissionAction = keyof typeof PERMISSION_MATRIX;

function getAllowedRoles(action: PermissionAction): readonly UserRole[] {
  return PERMISSION_MATRIX[action];
}

export function hasRole(
  user: AuthenticatedRequestUser | null,
  roles: UserRole | UserRole[],
): boolean {
  if (!user?.role) {
    return false;
  }

  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  return requiredRoles.includes(user.role);
}

export function hasPermission(
  user: AuthenticatedRequestUser | null,
  action: PermissionAction,
): boolean {
  if (!user?.role) {
    return false;
  }

  return getAllowedRoles(action).includes(user.role);
}

export function requireActiveRequestUser(
  event: H3Event,
): AuthenticatedRequestUser {
  const user = requireRequestUser(event);

  if (user.isActive === false) {
    throw forbiddenError("User account is inactive");
  }

  return user;
}

export function requireRole(
  event: H3Event,
  roles: UserRole | UserRole[],
  message = "You do not have permission to access this resource",
): AuthenticatedRequestUser {
  const user = requireActiveRequestUser(event);

  if (!hasRole(user, roles)) {
    throw forbiddenError(message);
  }

  return user;
}

export function requirePermission(
  event: H3Event,
  action: PermissionAction,
  message = "You do not have permission to perform this action",
): AuthenticatedRequestUser {
  const user = requireActiveRequestUser(event);

  if (!hasPermission(user, action)) {
    throw forbiddenError(message);
  }

  return user;
}

export function canAccessOwnedResource(
  user: AuthenticatedRequestUser | null,
  ownerUserId: string | null | undefined,
  fallbackAction?: PermissionAction,
): boolean {
  if (!user) {
    return false;
  }

  if (ownerUserId && user.id === ownerUserId) {
    return true;
  }

  if (!fallbackAction) {
    return false;
  }

  return hasPermission(user, fallbackAction);
}

export function requireOwnershipOrPermission(
  event: H3Event,
  ownerUserId: string | null | undefined,
  fallbackAction: PermissionAction,
  message = "You do not have permission to access this resource",
): AuthenticatedRequestUser {
  const user = requireActiveRequestUser(event);

  if (canAccessOwnedResource(user, ownerUserId, fallbackAction)) {
    return user;
  }

  throw forbiddenError(message);
}

export function getPermissionMatrix(): Record<
  PermissionAction,
  readonly UserRole[]
> {
  return PERMISSION_MATRIX;
}
