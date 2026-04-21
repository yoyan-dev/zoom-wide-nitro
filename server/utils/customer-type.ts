import type { AuthUserProfile } from "../types";
import type { AuthenticatedRequestUser } from "./auth";

type CustomerTypeUser = Pick<AuthenticatedRequestUser, "role" | "customerType">;
type AuthProfileUser = Pick<AuthUserProfile, "role" | "customer_type">;

export function isContractor(user: CustomerTypeUser | AuthProfileUser | null) {
  if (!user) {
    return false;
  }

  if ("customerType" in user) {
    return user.role === "customer" && user.customerType === "contractor";
  }

  return user.role === "customer" && user.customer_type === "contractor";
}

export function isRegular(user: CustomerTypeUser | AuthProfileUser | null) {
  if (!user) {
    return false;
  }

  if ("customerType" in user) {
    return user.role === "customer" && user.customerType === "regular";
  }

  return user.role === "customer" && user.customer_type === "regular";
}
