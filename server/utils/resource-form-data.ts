import type { MultiPartData } from "h3";

const PRODUCT_IMAGE_FIELD_ALIASES = [
  "image",
  "imageFile",
  "image_file",
  "file",
] as const;

const ACCOUNT_IMAGE_FIELD_ALIASES = [
  "profile",
  "profileImage",
  "profile_image",
  "image",
  "imageFile",
  "image_file",
  "file",
] as const;

function readPartValue(part: MultiPartData): string {
  return part.data.toString("utf8").trim();
}

function findPart(parts: MultiPartData[], field: string) {
  return parts.find((part) => part.name === field);
}

function parseOptionalString(parts: MultiPartData[], field: string) {
  const part = findPart(parts, field);

  if (!part) {
    return undefined;
  }

  const value = readPartValue(part);
  return value.length > 0 ? value : undefined;
}

function parseOptionalBoolean(parts: MultiPartData[], field: string) {
  const value = parseOptionalString(parts, field);

  if (value === undefined) {
    return undefined;
  }

  const normalized = value.toLowerCase();

  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(`${field} must be a boolean`);
}

function parseOptionalJson(parts: MultiPartData[], field: string) {
  const value = parseOptionalString(parts, field);

  if (value === undefined || value === "null") {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${field} must be valid JSON`);
  }
}

export function parseProductMultipartFields(parts: MultiPartData[]) {
  return {
    category_id: parseOptionalString(parts, "category_id"),
    supplier_id: parseOptionalString(parts, "supplier_id"),
    warehouse_id: parseOptionalString(parts, "warehouse_id"),
    sku: parseOptionalString(parts, "sku"),
    name: parseOptionalString(parts, "name"),
    description: parseOptionalString(parts, "description"),
    image_url: parseOptionalString(parts, "image_url"),
    unit: parseOptionalString(parts, "unit"),
    price: parseOptionalString(parts, "price"),
    stock_quantity: parseOptionalString(parts, "stock_quantity"),
    minimum_stock_quantity: parseOptionalString(parts, "minimum_stock_quantity"),
    handbook: parseOptionalJson(parts, "handbook"),
    is_active: parseOptionalBoolean(parts, "is_active"),
  };
}

export function getProductImagePart(parts: MultiPartData[]) {
  return parts.find(
    (part) =>
      !!part.name &&
      PRODUCT_IMAGE_FIELD_ALIASES.includes(
        part.name as (typeof PRODUCT_IMAGE_FIELD_ALIASES)[number],
      ) &&
      !!part.filename &&
      part.data.length > 0,
  );
}

export function parseUserMultipartFields(parts: MultiPartData[]) {
  return {
    email: parseOptionalString(parts, "email"),
    password: parseOptionalString(parts, "password"),
    full_name: parseOptionalString(parts, "full_name"),
    phone: parseOptionalString(parts, "phone"),
    role: parseOptionalString(parts, "role"),
    image_url: parseOptionalString(parts, "image_url"),
    is_active: parseOptionalBoolean(parts, "is_active"),
  };
}

export function parseDriverMultipartFields(parts: MultiPartData[]) {
  return {
    email: parseOptionalString(parts, "email"),
    password: parseOptionalString(parts, "password"),
    name: parseOptionalString(parts, "name"),
    phone: parseOptionalString(parts, "phone"),
    image_url: parseOptionalString(parts, "image_url"),
    license_number: parseOptionalString(parts, "license_number"),
    vehicle_number: parseOptionalString(parts, "vehicle_number"),
    is_active: parseOptionalBoolean(parts, "is_active"),
  };
}

export function parseCustomerMultipartFields(parts: MultiPartData[]) {
  return {
    user_id: parseOptionalString(parts, "user_id"),
    company_name: parseOptionalString(parts, "company_name"),
    contact_name: parseOptionalString(parts, "contact_name"),
    phone: parseOptionalString(parts, "phone"),
    email: parseOptionalString(parts, "email"),
    image_url: parseOptionalString(parts, "image_url"),
    billing_address: parseOptionalString(parts, "billing_address"),
    shipping_address: parseOptionalString(parts, "shipping_address"),
  };
}

export function parseCustomerRegisterMultipartFields(parts: MultiPartData[]) {
  return {
    email: parseOptionalString(parts, "email"),
    password: parseOptionalString(parts, "password"),
    company_name: parseOptionalString(parts, "company_name"),
    contact_name: parseOptionalString(parts, "contact_name"),
    phone: parseOptionalString(parts, "phone"),
    image_url: parseOptionalString(parts, "image_url"),
    billing_address: parseOptionalString(parts, "billing_address"),
    shipping_address: parseOptionalString(parts, "shipping_address"),
  };
}

export function parseOwnAccountMultipartFields(parts: MultiPartData[]) {
  return {
    email: parseOptionalString(parts, "email"),
    phone: parseOptionalString(parts, "phone"),
    image_url: parseOptionalString(parts, "image_url"),
    full_name: parseOptionalString(parts, "full_name"),
    name: parseOptionalString(parts, "name"),
    contact_name: parseOptionalString(parts, "contact_name"),
    company_name: parseOptionalString(parts, "company_name"),
    billing_address: parseOptionalString(parts, "billing_address"),
    shipping_address: parseOptionalString(parts, "shipping_address"),
    license_number: parseOptionalString(parts, "license_number"),
    vehicle_number: parseOptionalString(parts, "vehicle_number"),
  };
}

export function getAccountImagePart(parts: MultiPartData[]) {
  return parts.find(
    (part) =>
      !!part.name &&
      ACCOUNT_IMAGE_FIELD_ALIASES.includes(
        part.name as (typeof ACCOUNT_IMAGE_FIELD_ALIASES)[number],
      ) &&
      !!part.filename &&
      part.data.length > 0,
  );
}

export function parseInventoryMultipartFields(parts: MultiPartData[]) {
  return {
    product_id: parseOptionalString(parts, "product_id"),
    movement_type: parseOptionalString(parts, "movement_type"),
    quantity_change: parseOptionalString(parts, "quantity_change"),
    reference_type: parseOptionalString(parts, "reference_type"),
    reference_id: parseOptionalString(parts, "reference_id"),
    note: parseOptionalString(parts, "note"),
    created_by: parseOptionalString(parts, "created_by"),
  };
}

export function parseSupplierMultipartFields(parts: MultiPartData[]) {
  return {
    name: parseOptionalString(parts, "name"),
    contact_name: parseOptionalString(parts, "contact_name"),
    phone: parseOptionalString(parts, "phone"),
    email: parseOptionalString(parts, "email"),
    address: parseOptionalString(parts, "address"),
  };
}

export function parseWarehouseMultipartFields(parts: MultiPartData[]) {
  return {
    name: parseOptionalString(parts, "name"),
    address: parseOptionalString(parts, "address"),
    manager_id: parseOptionalString(parts, "manager_id"),
    capacity: parseOptionalString(parts, "capacity"),
    status: parseOptionalString(parts, "status"),
  };
}
