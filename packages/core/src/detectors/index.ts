import { businessDetectorRules } from "./business";
import { piiDetectorRules } from "./pii";
import { secretDetectorRules } from "./secret";
import { technicalDetectorRules } from "./technical";
import type { DetectorRule } from "../types";

export { businessDetectorRules, confidentialLineFindings, internalUrlFindings } from "./business";
export { piiDetectorRules, creditCardFindings, myNumberFindings, phoneFindings } from "./pii";
export { secretDetectorRules } from "./secret";
export { technicalDetectorRules } from "./technical";

export const categorizedDetectorRules = {
  pii: piiDetectorRules,
  secret: secretDetectorRules,
  business: businessDetectorRules,
  technical: technicalDetectorRules
} satisfies Record<string, DetectorRule[]>;

export const DEFAULT_DETECTOR_RULE_ORDER = [
  "email",
  "phone",
  "jwt",
  "aws_access_key",
  "github_token",
  "slack_token",
  "stripe_secret_key",
  "openai_api_key",
  "npm_token",
  "oauth_client_secret",
  "webhook_url",
  "private_key",
  "env_secret",
  "basic_auth_url",
  "database_url",
  "credit_card",
  "my_number",
  "url",
  "ip_address",
  "amount",
  "confidential_text",
  "internal_url",
  "date",
  "postal_code",
  "long_id"
] as const;

export function createOrderedDetectorRules(): DetectorRule[] {
  const rulesById = new Map<string, DetectorRule>();
  for (const rules of Object.values(categorizedDetectorRules)) {
    for (const rule of rules) {
      if (rulesById.has(rule.id)) {
        throw new Error(`Detector rule id is duplicated: ${rule.id}`);
      }
      rulesById.set(rule.id, rule);
    }
  }

  const orderedRuleIds = new Set<string>();
  for (const ruleId of DEFAULT_DETECTOR_RULE_ORDER) {
    if (orderedRuleIds.has(ruleId)) {
      throw new Error(`Detector rule order contains a duplicated id: ${ruleId}`);
    }
    orderedRuleIds.add(ruleId);
  }

  for (const ruleId of rulesById.keys()) {
    if (!orderedRuleIds.has(ruleId)) {
      throw new Error(`Detector rule is missing from default order: ${ruleId}`);
    }
  }

  return DEFAULT_DETECTOR_RULE_ORDER.map((ruleId) => {
    const rule = rulesById.get(ruleId);
    if (!rule) {
      throw new Error(`Detector rule is missing: ${ruleId}`);
    }
    return rule;
  });
}
