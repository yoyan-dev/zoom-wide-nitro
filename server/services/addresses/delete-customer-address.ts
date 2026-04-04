import { deleteAddressRecord } from "../../repositories/addresses/delete-address";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";

type DeleteCustomerAddressParams = {
  customerId: unknown;
  addressId: unknown;
};

export async function deleteCustomerAddress(
  params: DeleteCustomerAddressParams,
): Promise<void> {
  const customerId = string(params.customerId, "Customer id");
  const addressId = string(params.addressId, "Address id");
  const deleted = await deleteAddressRecord(customerId, addressId);

  if (!deleted) {
    throw notFoundError("Address not found");
  }
}
