import type { AuthResponseData } from "../../types";
import type { AuthenticatedRequestUser } from "../../utils/auth";
import { getCustomerByUserIdRecord } from "../../repositories/customers/get-customer-by-user-id";
import { getSupplierByUserIdRecord } from "../../repositories/supplier.repo";
import { mapCustomer } from "../customers/map-customer";

export function mapAuthUserProfile(user: AuthenticatedRequestUser) {
  return {
    id: user.id,
    email: user.email,
    image_url: user.imageUrl,
    role: user.role,
    customer_type: user.customer_type,
    roleSource: user.roleSource,
    is_active: user.isActive,
  };
}

export async function buildAuthResponseData(input: {
  user: AuthenticatedRequestUser;
  session: AuthResponseData["session"];
}): Promise<AuthResponseData> {
  const [customerRecord, supplierRecord] = await Promise.all([
    input.user.role === "customer"
      ? getCustomerByUserIdRecord(input.user.id)
      : Promise.resolve(null),
    input.user.role === "supplier"
      ? getSupplierByUserIdRecord(input.user.id)
      : Promise.resolve(null),
  ]);

  return {
    session: input.session,
    user: mapAuthUserProfile(input.user),
    customer: customerRecord ? mapCustomer(customerRecord) : null,
    supplier: supplierRecord ?? null,
  };
}
