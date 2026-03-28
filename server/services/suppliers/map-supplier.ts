import type { Supplier } from "../../types";

export function mapSupplier(record: Supplier): Supplier {
  return {
    ...record,
    contact_name: record.contact_name ?? undefined,
    phone: record.phone ?? undefined,
    email: record.email ?? undefined,
    address: record.address ?? undefined,
  };
}
