import type { Customer } from "./customer";
import type { Driver } from "./driver";
import type { UserRole } from "./user";

export interface AuthUserProfile {
  id: string;
  email: string | null;
  image_url: string | null;
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

export type AuthSignOutScope = "global" | "local" | "others";

export interface AuthResponseData {
  session: AuthSessionPayload | null;
  user: AuthUserProfile;
  customer: Customer | null;
}

export interface CurrentAccountData {
  user: AuthUserProfile;
  customer: Customer | null;
  driver: Driver | null;
}

export interface AuthLogoutResponseData {
  signed_out: true;
  scope: AuthSignOutScope;
}

export interface AuthChangePasswordResponseData {
  password_changed: true;
}

export interface AuthForgotPasswordResponseData {
  reset_email_sent: true;
}
