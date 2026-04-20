import type { H3Event } from "h3";
import type { Order } from "../../types";
import { getCustomerByIdRecord } from "../../repositories/customers/get-customer-by-id";
import { createOrderRequestSchema } from "../../schemas";
import { getOwnedProjectOrThrow } from "../projects/get-owned-project";
import { isContractor } from "../../utils/customer-type";
import {
  badRequestError,
  forbiddenError,
} from "../../utils/errors";
import { requireActiveRequestUser } from "../../utils/permissions";
import { createPendingOrder } from "./create-pending-order";

export async function createOrder(
  event: H3Event,
  input: unknown,
): Promise<Order> {
  const parsedInput = createOrderRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const requestUser = requireActiveRequestUser(event);
  const customer = await getCustomerByIdRecord(parsedInput.data.customer_id);

  if (!customer) {
    throw badRequestError("Customer not found");
  }

  if (parsedInput.data.project_id && !isContractor(requestUser)) {
    throw forbiddenError("Only contractors can use projects");
  }

  if (isContractor(requestUser)) {
    if (customer.user_id !== requestUser.id) {
      throw forbiddenError("Contractors can only create orders for their own account");
    }

    if (parsedInput.data.project_id) {
      await getOwnedProjectOrThrow(requestUser.id, parsedInput.data.project_id);
    }
  }

  return createPendingOrder(parsedInput.data);
}
