import type { Customer } from "../../types";

export function mapCustomer(record: Customer): Customer {
  return {
    ...record,
    user_id: record.user_id ?? null,
    phone: record.phone ?? null,
    billing_address: record.billing_address ?? null,
    shipping_address: record.shipping_address ?? null,
  };
}
