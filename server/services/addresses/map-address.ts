import type { Address } from "../../types";

export function mapAddress(record: Address): Address {
  return {
    ...record,
    postal_code: record.postal_code ?? null,
    country: record.country ?? null,
    address_line: record.address_line ?? null,
  };
}
