import type { H3Event } from "h3";
import type { CurrentAccountData, Customer } from "../../types";
import { getCustomerByUserIdRecord } from "../../repositories/customers/get-customer-by-user-id";
import { getDriverByUserIdRecord } from "../../repositories/drivers/get-driver-by-user-id";
import { updateCustomerRecord } from "../../repositories/customers/update-customer";
import { updateOwnAccountSchema } from "../../schemas";
import {
  badRequestError,
  forbiddenError,
  internalServerError,
  notFoundError,
} from "../../utils/errors";
import { requireActiveRequestUser } from "../../utils/permissions";
import { getCurrentAccount } from "./get-current-account";
import { updateDriverAccount } from "../drivers/update-driver-account";
import { updateManagedUser } from "../users/managed-users";

function hasUpdates(input: Record<string, unknown>) {
  return Object.values(input).some((value) => value !== undefined);
}

async function rollbackCustomerOrThrow(
  customerId: string,
  existingCustomer: Customer,
): Promise<void> {
  try {
    const rollbackResult = await updateCustomerRecord(customerId, {
      user_id: existingCustomer.user_id,
      company_name: existingCustomer.company_name,
      contact_name: existingCustomer.contact_name,
      phone: existingCustomer.phone,
      email: existingCustomer.email,
      image_url: existingCustomer.image_url,
      billing_address: existingCustomer.billing_address,
      shipping_address: existingCustomer.shipping_address,
    });

    if (!rollbackResult) {
      throw new Error("Rollback customer record not found");
    }
  } catch {
    throw internalServerError(
      "Account update failed and customer record rollback could not be completed",
    );
  }
}

export async function updateCurrentAccount(
  event: H3Event,
  input: unknown,
): Promise<CurrentAccountData> {
  const requestUser = requireActiveRequestUser(event);
  const parsedInput = updateOwnAccountSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  if (!hasUpdates(parsedInput.data)) {
    return getCurrentAccount(event);
  }

  if (!requestUser.role) {
    throw forbiddenError("User account role is not configured");
  }

  if (requestUser.role === "driver") {
    const existingDriver = await getDriverByUserIdRecord(requestUser.id);

    if (!existingDriver) {
      throw notFoundError("Driver account not found");
    }

    const driver = await updateDriverAccount({
      id: existingDriver.id,
      input: {
        email: parsedInput.data.email,
        name: parsedInput.data.name ?? parsedInput.data.full_name,
        phone: parsedInput.data.phone,
        image_url: parsedInput.data.image_url,
        license_number: parsedInput.data.license_number,
        vehicle_number: parsedInput.data.vehicle_number,
      },
    });

    return {
      ...(await getCurrentAccount(event)),
      driver,
    };
  }

  if (requestUser.role === "customer") {
    const customer = await getCustomerByUserIdRecord(requestUser.id);

    if (!customer) {
      throw notFoundError("Customer account not found");
    }

    const customerUpdates = {
      company_name: parsedInput.data.company_name,
      contact_name:
        parsedInput.data.contact_name ??
        parsedInput.data.full_name ??
        parsedInput.data.name,
      phone: parsedInput.data.phone,
      email: parsedInput.data.email,
      image_url: parsedInput.data.image_url,
      billing_address: parsedInput.data.billing_address,
      shipping_address: parsedInput.data.shipping_address,
    };
    const hasCustomerUpdates = hasUpdates(customerUpdates);

    if (hasCustomerUpdates) {
      try {
        const updatedCustomer = await updateCustomerRecord(
          customer.id,
          customerUpdates,
        );

        if (!updatedCustomer) {
          throw notFoundError("Customer account not found");
        }
      } catch (error) {
        if (error instanceof Error) {
          throw internalServerError(error.message);
        }

        throw internalServerError("Unable to update customer account");
      }
    }

    try {
      await updateManagedUser({
        id: requestUser.id,
        input: {
          email: parsedInput.data.email,
          full_name:
            parsedInput.data.contact_name ??
            parsedInput.data.full_name ??
            parsedInput.data.name,
          phone: parsedInput.data.phone,
          image_url: parsedInput.data.image_url,
        },
        allowedRoles: ["customer"],
        notFoundMessage: "Customer account not found",
      });
    } catch (error) {
      if (hasCustomerUpdates) {
        await rollbackCustomerOrThrow(customer.id, customer);
      }

      throw error;
    }

    return getCurrentAccount(event);
  }

  await updateManagedUser({
    id: requestUser.id,
    input: {
      email: parsedInput.data.email,
      full_name: parsedInput.data.full_name ?? parsedInput.data.name,
      phone: parsedInput.data.phone,
      image_url: parsedInput.data.image_url,
    },
    allowedRoles: [requestUser.role],
    notFoundMessage: "Account not found",
  });

  return getCurrentAccount(event);
}
