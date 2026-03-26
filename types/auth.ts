import type { Customer } from "./customer";
import type { UserRole } from "./user";

export interface AuthUserProfile {
  id: string;
  email: string | null;
  role: UserRole | null;
  roleSource: "users_table" | "auth_metadata" | "none";
  is_active: boolean | null;
}

export interface AuthSessionPayload {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number | null;
}

export interface AuthResponseData {
  session: AuthSessionPayload | null;
  user: AuthUserProfile;
  customer: Customer | null;
}
