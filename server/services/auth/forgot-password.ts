import type { AuthForgotPasswordResponseData } from "../../types";
import { sendSupabasePasswordResetEmail } from "../../lib/supabase";
import { forgotPasswordSchema } from "../../schemas";
import { badRequestError, internalServerError } from "../../utils/errors";

export async function forgotPassword(
  input: unknown,
): Promise<AuthForgotPasswordResponseData> {
  const parsedInput = forgotPasswordSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const { error } = await sendSupabasePasswordResetEmail({
    email: parsedInput.data.email,
    redirectTo: parsedInput.data.redirect_to,
  });

  if (error) {
    throw internalServerError(error.message ?? "Unable to send reset password email");
  }

  return {
    reset_email_sent: true,
  };
}
