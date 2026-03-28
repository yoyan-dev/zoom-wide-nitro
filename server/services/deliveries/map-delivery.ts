import type { Delivery, Order } from "../../types";

type DeliveryRecord = Delivery & {
  order?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mapDelivery(record: DeliveryRecord): Delivery {
  return {
    ...record,
    driver_id: record.driver_id ?? null,
    vehicle_number: record.vehicle_number ?? null,
    scheduled_at: record.scheduled_at ?? null,
    delivered_at: record.delivered_at ?? null,
    order: isRecord(record.order) ? (record.order as Order) : undefined,
  };
}
