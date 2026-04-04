import type { Address } from "../../types";
import { getAddressByIdRecord } from "../../repositories/addresses/get-address-by-id";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapAddress } from "./map-address";

type GetCustomerAddressByIdParams = {
  customerId: unknown;
  addressId: unknown;
};

export async function getCustomerAddressById(
  params: GetCustomerAddressByIdParams,
): Promise<Address> {
  const customerId = string(params.customerId, "Customer id");
  const addressId = string(params.addressId, "Address id");
  const address = await getAddressByIdRecord(customerId, addressId);

  if (!address) {
    throw notFoundError("Address not found");
  }

  return mapAddress(address);
}
