import { createError, defineEventHandler, type H3Event } from "h3";
import type { UserRole } from "../../shared/types";
import { requireAuth } from "./auth";

export type AppPermission =
  | "users.manage"
  | "categories.read"
  | "categories.manage"
  | "products.read"
  | "products.manage"
  | "suppliers.read"
  | "suppliers.manage"
  | "orders.read"
  | "orders.create"
  | "orders.manage"
  | "carts.manage"
  | "deliveries.read"
  | "deliveries.manage"
  | "deliveries.update_status"
  | "inventory.read"
  | "inventory.manage"
  | "payments.read"
  | "payments.manage"
  | "reports.read"
  | "settings.manage";

const ALL_PERMISSIONS: AppPermission[] = [
  "users.manage",
  "categories.read",
  "categories.manage",
  "products.read",
  "products.manage",
  "suppliers.read",
  "suppliers.manage",
  "orders.read",
  "orders.create",
  "orders.manage",
  "carts.manage",
  "deliveries.read",
  "deliveries.manage",
  "deliveries.update_status",
  "inventory.read",
  "inventory.manage",
  "payments.read",
  "payments.manage",
  "reports.read",
  "settings.manage",
];

const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  admin: ALL_PERMISSIONS,
  manager: [
    "categories.read",
    "orders.read",
    "orders.create",
    "orders.manage",
    "carts.manage",
    "deliveries.read",
    "deliveries.manage",
    "deliveries.update_status",
    "products.read",
    "inventory.read",
    "inventory.manage",
  ],
  staff: [
    "categories.read",
    "orders.read",
    "orders.create",
    "orders.manage",
    "carts.manage",
    "deliveries.read",
    "deliveries.manage",
    "deliveries.update_status",
    "products.read",
    "inventory.read",
    "inventory.manage",
  ],
  customer: [
    "categories.read",
    "products.read",
    "carts.manage",
    "orders.create",
    "orders.read",
    "deliveries.read",
    "payments.read",
    "payments.manage",
  ],
  warehouse_manager: [
    "categories.read",
    "products.read",
    "deliveries.read",
    "inventory.read",
    "inventory.manage",
  ],
  finance: [
    "orders.read",
    "payments.read",
    "payments.manage",
    "reports.read",
  ],
  driver: [
    "orders.read",
    "deliveries.read",
    "deliveries.update_status",
  ],
  supplier: [
    "categories.read",
    "products.read",
    "inventory.read",
    "inventory.manage",
  ],
  auditor: [
    "orders.read",
    "inventory.read",
    "payments.read",
    "reports.read",
  ],
};

function isUserRole(value: unknown): value is UserRole {
  return (
    value === "admin" ||
    value === "manager" ||
    value === "staff" ||
    value === "customer" ||
    value === "warehouse_manager" ||
    value === "finance" ||
    value === "driver" ||
    value === "supplier" ||
    value === "auditor"
  );
}

function resolveRole(event: H3Event): UserRole {
  const roleFromProfile = event.context.auth?.profile?.role;
  const roleFromMetadata =
    event.context.auth?.supabaseUser.app_metadata?.role ??
    event.context.auth?.supabaseUser.user_metadata?.role;

  if (isUserRole(roleFromProfile)) {
    return roleFromProfile;
  }

  if (isUserRole(roleFromMetadata)) {
    return roleFromMetadata;
  }

  throw createError({
    statusCode: 403,
    statusMessage: "No valid role found for authenticated user.",
  });
}

export async function requireRole(
  event: H3Event,
  allowedRoles: UserRole | UserRole[]
): Promise<UserRole> {
  await requireAuth(event);
  const role = resolveRole(event);
  const acceptedRoles = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];

  if (!acceptedRoles.includes(role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "You do not have access to this resource.",
    });
  }

  return role;
}

export async function requirePermission(
  event: H3Event,
  permissions: AppPermission | AppPermission[]
): Promise<UserRole> {
  await requireAuth(event);
  const role = resolveRole(event);
  const requiredPermissions = Array.isArray(permissions)
    ? permissions
    : [permissions];
  const grantedPermissions = ROLE_PERMISSIONS[role] ?? [];

  const hasAnyRequiredPermission = requiredPermissions.some((permission) =>
    grantedPermissions.includes(permission)
  );

  if (!hasAnyRequiredPermission) {
    throw createError({
      statusCode: 403,
      statusMessage: "Insufficient permissions for this action.",
    });
  }

  return role;
}

export async function requireAdmin(event: H3Event): Promise<void> {
  await requireRole(event, "admin");
}

export default defineEventHandler(async (event) => {
  if (event.path.startsWith("/api/admin")) {
    await requireAdmin(event);
  }
});
