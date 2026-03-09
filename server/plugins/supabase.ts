import { createClient } from "@supabase/supabase-js";
import { defineNitroPlugin, useRuntimeConfig } from "nitropack/runtime";
import type { Database } from "../../shared/types";

export default defineNitroPlugin((nitroApp) => {
  const runtimeConfig = useRuntimeConfig();
  const supabaseUrl =
    runtimeConfig.supabaseUrl || process.env.SUPABASE_URL || "";
  const serviceRoleKey =
    runtimeConfig.supabaseServiceRoleKey ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables."
    );
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  nitroApp.hooks.hook("request", (event) => {
    event.context.supabase = supabase;
  });
});
