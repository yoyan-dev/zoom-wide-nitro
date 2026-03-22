import type { Customer } from "../../../types";
import { createCustomerRecord } from "../../repositories/customers/create-customer";
import { createCustomerSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { mapCustomer } from "./map-customer";

export async function createCustomer(input: unknown): Promise<Customer> {
  const parsedInput = createCustomerSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const customer = await createCustomerRecord(parsedInput.data);

  return mapCustomer(customer);
}
