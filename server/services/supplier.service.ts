import type { PaginatedResult, Supplier } from "../types";
import { deleteSupabaseAuthUser } from "../lib/supabase";
import { deleteUserRecord } from "../repositories/users/delete-user";
import {
  createSupplierRecord,
  deleteSupplierRecord,
  getSupplierByIdRecord,
  getUserByEmailRecord,
  listSupplierRecords,
  updateSupplierRecord,
} from "../repositories/supplier.repo";
import { badRequestError, conflictError, internalServerError, notFoundError } from "../utils/errors";
import { getPagination, getPaginationMeta } from "../utils/pagination";
import { string } from "../utils/validator";
import { createManagedUserAccount } from "./users/create-managed-user-account";
import { updateManagedUser } from "./users/managed-users";
import { isDuplicateUserError } from "./users/user-account-errors";
import { z } from "zod";

const createSupplierSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  business_name: z.string().trim().min(1).max(160),
  contact_person: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(1).max(60).nullable().optional(),
  address: z.string().trim().min(1).max(500).nullable().optional(),
});

const updateSupplierSchema = z.object({
  email: z.string().trim().email().optional(),
  password: z.string().min(8).max(128).optional(),
  business_name: z.string().trim().min(1).max(160).optional(),
  contact_person: z.string().trim().min(1).max(160).optional(),
  phone: z.string().trim().min(1).max(60).nullable().optional(),
  address: z.string().trim().min(1).max(500).nullable().optional(),
  is_active: z.boolean().optional(),
});

export async function listSuppliers(params: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<Supplier[]>> {
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });
  const result = await listSupplierRecords({
    q: params.q,
    from: pagination.from,
    to: pagination.to,
  });

  return {
    data: result.data,
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}

export async function getSupplierById(id: unknown): Promise<Supplier> {
  const supplierId = string(id, "Supplier id");
  const supplier = await getSupplierByIdRecord(supplierId);

  if (!supplier) {
    throw notFoundError("Supplier not found");
  }

  return supplier;
}

export async function createSupplierAccount(input: unknown): Promise<Supplier> {
  const parsedInput = createSupplierSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const existingUser = await getUserByEmailRecord(parsedInput.data.email);

  if (existingUser) {
    throw conflictError("An account with this email already exists");
  }

  let userId: string | null = null;
  let supplierId: string | null = null;

  try {
    const user = await createManagedUserAccount({
      email: parsedInput.data.email,
      password: parsedInput.data.password,
      full_name: parsedInput.data.contact_person,
      role: "supplier",
      phone: parsedInput.data.phone ?? null,
      image_url: null,
    });

    userId = user.id;

    const supplier = await createSupplierRecord({
      user_id: user.id,
      name: parsedInput.data.business_name,
      contact_name: parsedInput.data.contact_person,
      phone: parsedInput.data.phone ?? null,
      email: parsedInput.data.email,
      address: parsedInput.data.address ?? null,
    });

    supplierId = supplier.id;
    return supplier;
  } catch (error) {
    if (supplierId) {
      await deleteSupplierRecord(supplierId).catch(() => undefined);
    }

    if (userId) {
      await deleteSupabaseAuthUser(userId).catch(() => undefined);
      await deleteUserRecord(userId).catch(() => undefined);
    }

    if (isDuplicateUserError(error)) {
      throw conflictError("An account with this email already exists");
    }

    if (error instanceof Error) {
      throw internalServerError(error.message);
    }

    throw internalServerError("Unable to create supplier account");
  }
}

export async function updateSupplierAccount(params: {
  id: unknown;
  input: unknown;
}): Promise<Supplier> {
  const supplierId = string(params.id, "Supplier id");
  const existingSupplier = await getSupplierByIdRecord(supplierId);

  if (!existingSupplier) {
    throw notFoundError("Supplier not found");
  }

  const parsedInput = updateSupplierSchema.safeParse(params.input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const hasUpdates = Object.values(parsedInput.data).some(
    (value) => value !== undefined,
  );

  if (!hasUpdates) {
    return existingSupplier;
  }

  const supplierRecordUpdates = {
    name: parsedInput.data.business_name,
    contact_name: parsedInput.data.contact_person,
    phone: parsedInput.data.phone,
    email: parsedInput.data.email,
    address: parsedInput.data.address,
  };
  const hasSupplierUpdates = Object.values(supplierRecordUpdates).some(
    (value) => value !== undefined,
  );

  let updatedSupplier = existingSupplier;

  if (hasSupplierUpdates) {
    try {
      const supplier = await updateSupplierRecord(supplierId, supplierRecordUpdates);

      if (!supplier) {
        throw notFoundError("Supplier not found");
      }

      updatedSupplier = supplier;
    } catch (error) {
      if (isDuplicateUserError(error)) {
        throw conflictError("An account with this email already exists");
      }

      if (error instanceof Error) {
        throw internalServerError(error.message);
      }

      throw internalServerError("Unable to update supplier account");
    }
  }

  const hasManagedUserUpdates =
    parsedInput.data.email !== undefined ||
    parsedInput.data.password !== undefined ||
    parsedInput.data.contact_person !== undefined ||
    parsedInput.data.phone !== undefined ||
    parsedInput.data.is_active !== undefined;

  if (!hasManagedUserUpdates || !existingSupplier.user_id) {
    return updatedSupplier;
  }

  try {
    await updateManagedUser({
      id: existingSupplier.user_id,
      input: {
        email: parsedInput.data.email,
        password: parsedInput.data.password,
        full_name: parsedInput.data.contact_person,
        phone: parsedInput.data.phone,
        is_active: parsedInput.data.is_active,
      },
      allowedRoles: ["supplier"],
      notFoundMessage: "Supplier not found",
    });

    const supplier = await getSupplierByIdRecord(supplierId);

    if (!supplier) {
      throw notFoundError("Supplier not found");
    }

    return supplier;
  } catch (error) {
    if (hasSupplierUpdates) {
      await updateSupplierRecord(supplierId, {
        name: existingSupplier.name,
        contact_name: existingSupplier.contact_name,
        phone: existingSupplier.phone,
        email: existingSupplier.email,
        address: existingSupplier.address,
      }).catch(() => undefined);
    }

    if (isDuplicateUserError(error)) {
      throw conflictError("An account with this email already exists");
    }

    if (error instanceof Error) {
      throw internalServerError(error.message);
    }

    throw internalServerError("Unable to update supplier account");
  }
}

export async function deleteSupplierAccount(id: unknown): Promise<void> {
  const supplierId = string(id, "Supplier id");
  const supplier = await getSupplierByIdRecord(supplierId);

  if (!supplier) {
    throw notFoundError("Supplier not found");
  }

  if (supplier.user_id) {
    await deleteSupabaseAuthUser(supplier.user_id);
    await deleteUserRecord(supplier.user_id);
    return;
  }

  await deleteSupplierRecord(supplierId);
}
