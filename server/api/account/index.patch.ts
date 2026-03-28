import { defineEventHandler } from "h3";
import { updateCurrentAccount } from "../../services/account/update-current-account";
import { readOwnAccountInput } from "../../utils/account-form-data";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const account = await updateCurrentAccount(
      event,
      await readOwnAccountInput(event),
    );

    return ok(account, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
