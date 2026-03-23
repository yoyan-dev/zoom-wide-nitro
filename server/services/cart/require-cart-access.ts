import type { H3Event } from "h3";
import type { Customer } from "../../../types";
import { requireCustomerAccess } from "../customers/require-customer-access";

export function requireCartReadAccess(
  event: H3Event,
  customerId: unknown,
  message = "You do not have permission to access this cart",
): Promise<Customer> {
  return requireCustomerAccess(event, customerId, "cart:read", message);
}

export function requireCartWriteAccess(
  event: H3Event,
  customerId: unknown,
  message = "You do not have permission to modify this cart",
): Promise<Customer> {
  return requireCustomerAccess(event, customerId, "cart:write", message);
}
