import type { Customer } from "../../types";
import { getCustomerByIdRecord } from "../../repositories/customers/get-customer-by-id";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";

export async function getValidCartCustomer(id: unknown): Promise<Customer> {
  const customerId = string(id, "customer_id");
  const customer = await getCustomerByIdRecord(customerId);

  if (!customer) {
    throw notFoundError("Customer not found");
  }

  return customer;
}
