import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { User } from "../../shared/types";

export interface AuthContext {
  token: string;
  supabaseUser: SupabaseAuthUser;
  profile: User | null;
}

export * from "./tables";
export * from "./dtos";
