import { createError, type H3Event } from "h3";
import type { Customer } from "../../shared/types";
import type { CreateCustomerPayload } from "../types";
import {
  createCustomer,
  getCustomerById,
  listCustomers,
} from "../repositories/customer.repo";
import { assertExists, getSupabaseClient } from "../utils/supabase";

export async function listCustomersService(event: H3Event): Promise<Customer[]> {
  return listCustomers(getSupabaseClient(event));
}

export async function getCustomerService(
  event: H3Event,
  id: string
): Promise<Customer> {
  const customer = await getCustomerById(getSupabaseClient(event), id);
  return assertExists(customer, "Customer not found.");
}

export async function createCustomerService(
  event: H3Event,
  payload: CreateCustomerPayload
): Promise<Customer> {
  if (!payload.company_name || !payload.contact_name || !payload.email) {
    throw createError({
      statusCode: 400,
      statusMessage: "company_name, contact_name and email are required.",
    });
  }

  return createCustomer(getSupabaseClient(event), payload);
}
