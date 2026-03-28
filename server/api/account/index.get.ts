import { defineEventHandler } from "h3";
import { getCurrentAccount } from "../../services/account/get-current-account";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const account = await getCurrentAccount(event);

    return ok(account, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
