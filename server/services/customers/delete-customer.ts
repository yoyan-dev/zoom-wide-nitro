import { deleteCustomerRecord } from "../../repositories/customers/delete-customer";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";

export async function deleteCustomer(id: unknown): Promise<void> {
  const customerId = string(id, "Customer id");
  const deleted = await deleteCustomerRecord(customerId);

  if (!deleted) {
    throw notFoundError("Customer not found");
  }
}
