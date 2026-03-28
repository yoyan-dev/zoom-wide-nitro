import type { AuthResponseData } from "../../types";
import type { AuthenticatedRequestUser } from "../../utils/auth";
import { getCustomerByUserIdRecord } from "../../repositories/customers/get-customer-by-user-id";
import { mapCustomer } from "../customers/map-customer";

export function mapAuthUserProfile(user: AuthenticatedRequestUser) {
  return {
    id: user.id,
    email: user.email,
    image_url: user.imageUrl,
    role: user.role,
    roleSource: user.roleSource,
    is_active: user.isActive,
  };
}

export async function buildAuthResponseData(input: {
  user: AuthenticatedRequestUser;
  session: AuthResponseData["session"];
}): Promise<AuthResponseData> {
  const customerRecord =
    input.user.role === "customer"
      ? await getCustomerByUserIdRecord(input.user.id)
      : null;

  return {
    session: input.session,
    user: mapAuthUserProfile(input.user),
    customer: customerRecord ? mapCustomer(customerRecord) : null,
  };
}
