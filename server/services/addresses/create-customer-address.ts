import type { Address } from "../../types";
import { createAddressRecord } from "../../repositories/addresses/create-address";
import { createAddressSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapAddress } from "./map-address";

const createCustomerAddressInputSchema = createAddressSchema.omit({
  customer_id: true,
});

export async function createCustomerAddress(
  customerId: unknown,
  input: unknown,
): Promise<Address> {
  const resolvedCustomerId = string(customerId, "Customer id");
  const parsedInput = createCustomerAddressInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const address = await createAddressRecord({
    customer_id: resolvedCustomerId,
    ...parsedInput.data,
  });

  return mapAddress(address);
}
