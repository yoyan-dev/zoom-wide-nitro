import type { Customer } from "../../../types";
import { getCustomerByIdRecord } from "../../repositories/customers/get-customer-by-id";
import { updateCustomerRecord } from "../../repositories/customers/update-customer";
import { updateCustomerSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapCustomer } from "./map-customer";

type UpdateCustomerParams = {
  id: unknown;
  input: unknown;
};

export async function updateCustomer(
  params: UpdateCustomerParams,
): Promise<Customer> {
  const customerId = string(params.id, "Customer id");
  const parsedInput = updateCustomerSchema.safeParse(params.input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const hasUpdates = Object.values(parsedInput.data).some(
    (value) => value !== undefined,
  );

  if (!hasUpdates) {
    const existingCustomer = await getCustomerByIdRecord(customerId);

    if (!existingCustomer) {
      throw notFoundError("Customer not found");
    }

    return mapCustomer(existingCustomer);
  }

  const updatedCustomer = await updateCustomerRecord(customerId, parsedInput.data);

  if (!updatedCustomer) {
    throw notFoundError("Customer not found");
  }

  return mapCustomer(updatedCustomer);
}
