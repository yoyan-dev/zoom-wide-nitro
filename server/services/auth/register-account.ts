import type { AuthResponseData } from "../../types";
import {
  createSupabaseAuthUser,
  deleteSupabaseAuthUser,
} from "../../lib/supabase";
import { createCustomerRecord } from "../../repositories/customers/create-customer";
import { deleteCustomerRecord } from "../../repositories/customers/delete-customer";
import { createDriverRecord } from "../../repositories/drivers/create-driver";
import { deleteDriverRecord } from "../../repositories/drivers/delete-driver";
import { createUserRecord } from "../../repositories/users/create-user";
import { registerAccountSchema } from "../../schemas";
import {
  badRequestError,
  conflictError,
  internalServerError,
} from "../../utils/errors";
import { resolveAuthenticatedUser } from "../users/resolve-authenticated-user";
import { buildAuthResponseData } from "./map-auth-response";

function isDuplicateUserError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("already been registered") ||
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("duplicate")
  );
}

export async function registerAccount(
  input: unknown,
): Promise<AuthResponseData> {
  const parsedInput = registerAccountSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const { data } = parsedInput;
  let authUserId: string | null = null;
  let customerId: string | null = null;
  let driverId: string | null = null;

  try {
    const authUser = await createSupabaseAuthUser({
      email: data.email,
      password: data.password,
      role: data.role,
      customerType: data.role === "customer" ? data.customer_type : null,
      fullName: data.contact_name,
      phone: data.phone ?? null,
      imageUrl: data.image_url ?? null,
    });

    authUserId = authUser.id;

    await createUserRecord({
      id: authUser.id,
      email: data.email,
      full_name: data.contact_name,
      role: data.role,
      customer_type: data.role === "customer" ? data.customer_type : null,
      phone: data.phone ?? null,
      image_url: data.image_url ?? null,
    });

    if (data.role === "customer") {
      const customer = await createCustomerRecord({
        user_id: authUser.id,
        company_name: data.company_name as string,
        contact_name: data.contact_name,
        phone: data.phone ?? null,
        email: data.email,
        image_url: data.image_url ?? null,
        billing_address: data.billing_address ?? null,
        shipping_address: data.shipping_address ?? null,
      });

      customerId = customer.id;
    }

    if (data.role === "driver") {
      const driver = await createDriverRecord({
        user_id: authUser.id,
        name: data.contact_name,
        phone: data.phone ?? null,
        email: data.email,
        image_url: data.image_url ?? null,
        license_number: null,
        vehicle_number: null,
        is_active: true,
      });

      driverId = driver.id;
    }

    const resolvedUser = await resolveAuthenticatedUser({
      id: authUser.id,
      email: data.email,
      imageUrl: data.image_url ?? null,
      role: data.role,
      customer_type: data.role === "customer" ? data.customer_type : null,
    });

    return buildAuthResponseData({
      user: resolvedUser,
      session: null,
    });
  } catch (error) {
    if (driverId) {
      try {
        await deleteDriverRecord(driverId);
      } catch {
        throw internalServerError(
          "Account registration failed and driver cleanup could not be completed",
        );
      }
    }

    if (customerId) {
      try {
        await deleteCustomerRecord(customerId);
      } catch {
        throw internalServerError(
          "Account registration failed and customer cleanup could not be completed",
        );
      }
    }

    if (authUserId) {
      try {
        await deleteSupabaseAuthUser(authUserId);
      } catch {
        throw internalServerError(
          "Account registration failed and auth cleanup could not be completed",
        );
      }
    }

    if (isDuplicateUserError(error)) {
      throw conflictError("An account with this email already exists");
    }

    if (error instanceof Error) {
      throw internalServerError(error.message);
    }

    throw internalServerError("Unable to register account");
  }
}
