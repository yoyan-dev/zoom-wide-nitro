import type { H3Event } from "h3";
import type { Customer } from "../../types";
import { getCustomerByIdRecord } from "../../repositories/customers/get-customer-by-id";
import { notFoundError } from "../../utils/errors";
import {
  type PermissionAction,
  requireOwnershipOrPermission,
} from "../../utils/permissions";
import { string } from "../../utils/validator";
import { mapCustomer } from "./map-customer";

export async function requireCustomerAccess(
  event: H3Event,
  customerId: unknown,
  fallbackAction: PermissionAction,
  message = "You do not have permission to access this customer resource",
): Promise<Customer> {
  const resolvedCustomerId = string(customerId, "Customer id");
  const customer = await getCustomerByIdRecord(resolvedCustomerId);

  if (!customer) {
    throw notFoundError("Customer not found");
  }

  requireOwnershipOrPermission(
    event,
    customer.user_id,
    fallbackAction,
    message,
  );

  return mapCustomer(customer);
}
