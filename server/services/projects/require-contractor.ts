import type { H3Event } from "h3";
import { isContractor } from "../../utils/customer-type";
import { requireActiveRequestUser } from "../../utils/permissions";
import { forbiddenError } from "../../utils/errors";

export function requireContractor(event: H3Event) {
  const user = requireActiveRequestUser(event);

  if (!isContractor(user)) {
    throw forbiddenError("Only contractors can use projects");
  }

  return user;
}
