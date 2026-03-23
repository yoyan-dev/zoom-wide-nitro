import type { z } from "zod";
import type { Supplier } from "../../../types";
import { updateSupplierSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

export async function updateSupplierRecord(
  id: string,
  input: UpdateSupplierInput,
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
    .select("*")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Supplier | null);
}
