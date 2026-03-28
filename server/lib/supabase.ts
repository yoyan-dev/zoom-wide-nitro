import {
  createClient,
  type SupabaseClient,
  type AuthResponse,
  type Session,
  type User as SupabaseAuthUser,
} from "@supabase/supabase-js";
import { useRuntimeConfig } from "nitropack/runtime";
import type { UserRole } from "../types";

let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseConfig() {
  const runtimeConfig = useRuntimeConfig();
  const supabaseUrl =
    runtimeConfig.supabaseUrl || process.env.SUPABASE_URL || "";
  const anonKey =
    runtimeConfig.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || "";
  const serviceRoleKey =
    runtimeConfig.supabaseServiceRoleKey ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  }

  return {
    supabaseUrl,
    anonKey,
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

export function getSupabaseAuthClient(): SupabaseClient {
  const { supabaseUrl, anonKey, serviceRoleKey } = getSupabaseConfig();
  const authKey = anonKey || serviceRoleKey;

  // Auth clients should be request-scoped so session mutations do not leak
  // across concurrent requests in the server process.
  return createClient(supabaseUrl, authKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
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

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const supabase = getSupabaseAuthClient();

  return supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
}

export async function refreshSupabaseSession(
  refreshToken: string,
): Promise<AuthResponse> {
  const supabase = getSupabaseAuthClient();

  return supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });
}

export async function sendSupabasePasswordResetEmail(input: {
  email: string;
  redirectTo?: string;
}) {
  const supabase = getSupabaseAuthClient();

  return supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: input.redirectTo,
  });
}

export async function signOutSupabaseSession(input: {
  accessToken: string;
  refreshToken: string;
  scope?: "global" | "local" | "others";
}) {
  const supabase = getSupabaseAuthClient();
  const { error: setSessionError } = await supabase.auth.setSession({
    access_token: input.accessToken,
    refresh_token: input.refreshToken,
  });

  if (setSessionError) {
    return { error: setSessionError };
  }

  return supabase.auth.signOut({
    scope: input.scope,
  });
}

export async function createSupabaseAuthUser(input: {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  phone?: string | null;
  imageUrl?: string | null;
}): Promise<SupabaseAuthUser> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    app_metadata: {
      role: input.role,
    },
    user_metadata: {
      full_name: input.fullName,
      phone: input.phone ?? null,
      image_url: input.imageUrl ?? null,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error("Failed to create authentication user");
  }

  return data.user;
}

export async function deleteSupabaseAuthUser(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw error;
  }
}

export async function updateSupabaseAuthUser(input: {
  userId: string;
  email?: string;
  password?: string;
  role?: UserRole;
  fullName?: string;
  phone?: string | null;
  imageUrl?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = {};

  if (input.email !== undefined) {
    payload.email = input.email;
    payload.email_confirm = true;
  }

  if (input.password !== undefined) {
    payload.password = input.password;
  }

  if (input.role !== undefined) {
    payload.app_metadata = {
      role: input.role,
    };
  }

  if (
    input.fullName !== undefined ||
    input.phone !== undefined ||
    input.imageUrl !== undefined
  ) {
    const userMetadata: Record<string, unknown> = {};

    if (input.fullName !== undefined) {
      userMetadata.full_name = input.fullName;
    }

    if (input.phone !== undefined) {
      userMetadata.phone = input.phone;
    }

    if (input.imageUrl !== undefined) {
      userMetadata.image_url = input.imageUrl;
    }

    payload.user_metadata = userMetadata;
  }

  if (!Object.keys(payload).length) {
    return;
  }

  const { error } = await supabase.auth.admin.updateUserById(
    input.userId,
    payload,
  );

  if (error) {
    throw error;
  }
}

export function mapSupabaseSession(session: Session) {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: session.token_type,
    expires_in: session.expires_in,
    expires_at: session.expires_at ?? null,
  };
}
