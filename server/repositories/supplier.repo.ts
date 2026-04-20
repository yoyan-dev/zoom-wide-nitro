import type { Supplier } from "../types";
import type { RepositoryListResult } from "../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  mapOptionalRecord,
  useRepositoryClient,
} from "../utils/supabase-repository";
import { USER_SELECT } from "./users/user-select";

const SUPPLIER_SELECT = `id, user_id, name, contact_name, phone, email, address, created_at, updated_at, user:user_id(${USER_SELECT})`;

export async function getUserByEmailRecord(email: string): Promise<{
  id: string;
  email: string;
} | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as { id: string; email: string } | null);
}

export async function listSupplierRecords(params: {
  q?: string;
  from: number;
  to: number;
}): Promise<RepositoryListResult<Supplier>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("suppliers")
    .select(SUPPLIER_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (params.q) {
    query = query.or(
      [
        `name.ilike.%${params.q}%`,
        `contact_name.ilike.%${params.q}%`,
        `phone.ilike.%${params.q}%`,
        `email.ilike.%${params.q}%`,
        `address.ilike.%${params.q}%`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Supplier[],
    count,
  });
}

export async function getSupplierByIdRecord(id: string): Promise<Supplier | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select(SUPPLIER_SELECT)
    .eq("id", id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Supplier | null);
}

export async function getSupplierByUserIdRecord(
  userId: string,
): Promise<Supplier | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select(SUPPLIER_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Supplier | null);
}

export async function createSupplierRecord(input: {
  user_id: string;
  name: string;
  contact_name: string;
  phone?: string | null;
  email: string;
  address?: string | null;
}): Promise<Supplier> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      user_id: input.user_id,
      name: input.name,
      contact_name: input.contact_name,
      phone: input.phone ?? null,
      email: input.email,
      address: input.address ?? null,
      created_at: now,
      updated_at: now,
    })
    .select(SUPPLIER_SELECT)
    .single();

  ensureRepositorySuccess(error);
  return data as Supplier;
}

export async function updateSupplierRecord(
  id: string,
  input: {
    name?: string;
    contact_name?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  },
): Promise<Supplier | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      name: input.name,
      contact_name: input.contact_name,
      phone: input.phone,
      email: input.email,
      address: input.address,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("suppliers")
    .update(updates)
    .eq("id", id)
    .select(SUPPLIER_SELECT)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Supplier | null);
}

export async function deleteSupplierRecord(id: string): Promise<boolean> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return !!data;
}
