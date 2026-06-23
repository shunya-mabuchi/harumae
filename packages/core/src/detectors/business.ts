import { createRegexRule } from "../regexRuleFactory";
import { createRuleFinding, regexFindings } from "../ruleHelpers";
import type { DetectorRule, Finding } from "../types";

const amountRule = createRegexRule({
  id: "amount",
  label: "金額",
  riskLevel: "medium",
  pattern:
    /(?:月額\s*)?(?:¥|￥)\s?\d{1,3}(?:,\d{3})*(?:\.\d+)?|(?:月額\s*)?\d{1,3}(?:,\d{3})*(?:万円|円)|(?:月額\s*)?\d+(?:\.\d+)?万円/g
});

const confidentialTextRule: DetectorRule = {
  id: "confidential_text",
  label: "社外秘・注意語を含む文",
  riskLevel: "medium",
  enabled: true,
  createFindings: (input) => confidentialLineFindings(input, confidentialTextRule)
};

const internalUrlRule: DetectorRule = {
  id: "internal_url",
  label: "社内URLっぽいもの",
  riskLevel: "medium",
  enabled: true,
  createFindings: (input) => internalUrlFindings(input, internalUrlRule)
};

export function confidentialLineFindings(input: string, rule: DetectorRule): Finding[] {
  const findings: Finding[] = [];
  const keywordPattern = /社外秘|秘密|confidential|取扱注意|関係者限り|NDA|未公開|口外禁止/i;
  const linePattern = /[^\r\n]+/g;
  let match: RegExpExecArray | null;

  while ((match = linePattern.exec(input)) !== null) {
    const line = match[0];
    if (keywordPattern.test(line)) {
      findings.push(createRuleFinding(input, rule, match.index, match.index + line.length, 0.9));
    }
  }

  return findings;
}

export function internalUrlFindings(input: string, rule: DetectorRule): Finding[] {
  const findings: Finding[] = [];
  const urlPattern = /\bhttps?:\/\/[^\s<>"'）)]+/gi;
  const domainPattern =
    /\b(?:localhost|[a-z0-9.-]*(?:intranet|internal|corp|staging|dev|test|local)[a-z0-9.-]*(?::\d+)?(?:\/[^\s<>"'）)]*)?)/gi;
  const markerPattern = /localhost|intranet|internal|corp|staging|dev|test|local/i;

  for (const finding of regexFindings(input, rule, urlPattern)) {
    if (markerPattern.test(finding.text)) {
      findings.push(finding);
    }
  }

  for (const finding of regexFindings(input, rule, domainPattern)) {
    const value = finding.text;
    if (value.length >= 4 && markerPattern.test(value)) {
      findings.push(finding);
    }
  }

  return findings;
}

export const businessDetectorRules: DetectorRule[] = [
  amountRule,
  confidentialTextRule,
  internalUrlRule
];
