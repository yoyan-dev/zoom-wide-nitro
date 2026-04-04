import type { Address } from "../../types";
import { getAddressByIdRecord } from "../../repositories/addresses/get-address-by-id";
import { updateAddressRecord } from "../../repositories/addresses/update-address";
import { updateAddressSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapAddress } from "./map-address";

type UpdateCustomerAddressParams = {
  customerId: unknown;
  addressId: unknown;
  input: unknown;
};

export async function updateCustomerAddress(
  params: UpdateCustomerAddressParams,
): Promise<Address> {
  const customerId = string(params.customerId, "Customer id");
  const addressId = string(params.addressId, "Address id");
  const parsedInput = updateAddressSchema.safeParse(params.input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const hasUpdates = Object.values(parsedInput.data).some(
    (value) => value !== undefined,
  );

  if (!hasUpdates) {
    const existingAddress = await getAddressByIdRecord(customerId, addressId);

    if (!existingAddress) {
      throw notFoundError("Address not found");
    }

    return mapAddress(existingAddress);
  }

  const updatedAddress = await updateAddressRecord(
    customerId,
    addressId,
    parsedInput.data,
  );

  if (!updatedAddress) {
    throw notFoundError("Address not found");
  }

  return mapAddress(updatedAddress);
}
