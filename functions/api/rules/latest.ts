import { handleRequest } from "../../../apps/worker/src/index";

interface RuleDeliveryEnv {
  RULE_KEY_ID?: string;
  RULE_SIGNING_PRIVATE_JWK?: string;
}

interface PagesFunctionContext {
  request: Request;
  env: RuleDeliveryEnv;
}

export function onRequest(context: PagesFunctionContext): Promise<Response> {
  return handleRequest(context.request, context.env);
}
