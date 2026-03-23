import {
  createClient,
  type SupabaseClient,
  type User as SupabaseAuthUser,
} from "@supabase/supabase-js";
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

export async function getSupabaseAuthUser(
  accessToken: string,
): Promise<SupabaseAuthUser | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}
