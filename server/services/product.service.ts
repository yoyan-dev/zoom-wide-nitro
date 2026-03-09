import { createError, getQuery, type H3Event } from "h3";
import type { Product } from "../../shared/types";
import type { CreateProductPayload, UpdateProductPayload } from "../types";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../repositories/product.repo";
import { assertExists, getSupabaseClient } from "../utils/supabase";

function validateProductPayload(payload: CreateProductPayload): void {
  if (!payload.category_id || !payload.sku || !payload.name) {
    throw createError({
      statusCode: 400,
      statusMessage: "category_id, sku, and name are required.",
    });
  }

  if (typeof payload.price !== "number" || payload.price < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "price must be a non-negative number.",
    });
  }
}

export async function listProductsService(event: H3Event): Promise<Product[]> {
  const query = getQuery(event);
  const filters = {
    categoryId:
      typeof query.category_id === "string" ? query.category_id : undefined,
    supplierId:
      typeof query.supplier_id === "string" ? query.supplier_id : undefined,
    isActive:
      typeof query.is_active === "string"
        ? query.is_active === "true"
        : undefined,
    search: typeof query.search === "string" ? query.search : undefined,
  };

  return listProducts(getSupabaseClient(event), filters);
}

export async function getProductService(
  event: H3Event,
  id: string
): Promise<Product> {
  const product = await getProductById(getSupabaseClient(event), id);
  return assertExists(product, "Product not found.");
}

export async function createProductService(
  event: H3Event,
  payload: CreateProductPayload
): Promise<Product> {
  validateProductPayload(payload);
  return createProduct(getSupabaseClient(event), payload);
}

export async function updateProductService(
  event: H3Event,
  payload: UpdateProductPayload
): Promise<Product> {
  const supabase = getSupabaseClient(event);
  await getProductService(event, payload.id);

  const updated = await updateProduct(supabase, payload.id, payload);
  return assertExists(updated, "Product not found.");
}

export async function deleteProductService(
  event: H3Event,
  id: string
): Promise<{ success: true }> {
  await getProductService(event, id);
  await deleteProduct(getSupabaseClient(event), id);
  return { success: true };
}
