import type { Customer } from "../../../types";
import { getCustomerByIdRecord } from "../../repositories/customers/get-customer-by-id";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapCustomer } from "./map-customer";

export async function getCustomerById(id: unknown): Promise<Customer> {
  const customerId = string(id, "Customer id");
  const customer = await getCustomerByIdRecord(customerId);

  if (!customer) {
    throw notFoundError("Customer not found");
  }

  return mapCustomer(customer);
}
