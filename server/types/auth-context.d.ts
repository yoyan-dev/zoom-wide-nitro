import type { RequestAuthContext } from "../utils/auth";

declare module "h3" {
  interface H3EventContext {
    auth?: RequestAuthContext;
  }
}
