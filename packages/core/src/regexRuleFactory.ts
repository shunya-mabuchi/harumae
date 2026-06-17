import { regexFindings } from "./ruleHelpers";
import type { DetectorRule, RiskLevel } from "./types";

interface RegexRuleDefinition {
  id: string;
  label: string;
  riskLevel: RiskLevel;
  pattern: RegExp;
}

export function createRegexRule(definition: RegexRuleDefinition): DetectorRule {
  const rule: DetectorRule = {
    id: definition.id,
    label: definition.label,
    riskLevel: definition.riskLevel,
    enabled: true,
    createFindings: (input) => regexFindings(input, rule, definition.pattern)
  };

  return rule;
}
