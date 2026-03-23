import type { Order } from "../../../types";
import { createOrderRequestSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { createPendingOrder } from "./create-pending-order";

export async function createOrder(input: unknown): Promise<Order> {
  const parsedInput = createOrderRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  return createPendingOrder(parsedInput.data);
}
