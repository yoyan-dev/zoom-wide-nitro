import type { CurrentAccountData } from "../../types";
import { getCustomerByUserIdRecord } from "../../repositories/customers/get-customer-by-user-id";
import { getDriverByUserIdRecord } from "../../repositories/drivers/get-driver-by-user-id";
import { getSupplierByUserIdRecord } from "../../repositories/supplier.repo";
import { requireActiveRequestUser } from "../../utils/permissions";
import { resolveAuthenticatedUser } from "../users/resolve-authenticated-user";
import { mapAuthUserProfile } from "../auth/map-auth-response";
import { mapCustomer } from "../customers/map-customer";

export async function getCurrentAccount(
  event: Parameters<typeof requireActiveRequestUser>[0],
): Promise<CurrentAccountData> {
  const requestUser = requireActiveRequestUser(event);
  const resolvedUser = await resolveAuthenticatedUser({
    id: requestUser.id,
    email: requestUser.email,
    imageUrl: requestUser.imageUrl,
    role: requestUser.role,
    customerType: requestUser.customerType,
  });
  const [customer, driver, supplier] = await Promise.all([
    getCustomerByUserIdRecord(requestUser.id),
    getDriverByUserIdRecord(requestUser.id),
    getSupplierByUserIdRecord(requestUser.id),
  ]);

  return {
    user: mapAuthUserProfile(resolvedUser),
    customer: customer ? mapCustomer(customer) : null,
    driver: driver ?? null,
    supplier: supplier ?? null,
  };
}
