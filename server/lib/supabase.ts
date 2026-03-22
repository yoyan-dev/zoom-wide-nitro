import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "nitropack/runtime";

let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseConfig() {
  const runtimeConfig = useRuntimeConfig();
  const supabaseUrl = runtimeConfig.supabaseUrl || process.env.SUPABASE_URL || "";
  const serviceRoleKey =
    runtimeConfig.supabaseServiceRoleKey ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.",
    );
  }

  return {
    supabaseUrl,
    serviceRoleKey,
  };
}

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();

  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdmin;
}

export function getSupabaseRepositoryClient(): SupabaseClient {
  return getSupabaseAdmin();
}
