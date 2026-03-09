import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../shared/types";
import type { AuthContext } from "./index";

declare module "h3" {
  interface H3EventContext {
    supabase?: SupabaseClient<Database>;
    auth?: AuthContext;
  }
}

export {};
