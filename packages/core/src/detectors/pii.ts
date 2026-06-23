import { createRegexRule } from "../regexRuleFactory";
import { createRuleFinding, luhnCheck, regexFindings } from "../ruleHelpers";
import type { DetectorRule, Finding } from "../types";

const emailRule = createRegexRule({
  id: "email",
  label: "メールアドレス",
  riskLevel: "high",
  pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
});

const phoneRule: DetectorRule = {
  id: "phone",
  label: "日本の電話番号",
  riskLevel: "high",
  enabled: true,
  createFindings: (input) => phoneFindings(input, phoneRule)
};

const creditCardRule: DetectorRule = {
  id: "credit_card",
  label: "クレジットカード風番号",
  riskLevel: "high",
  enabled: true,
  createFindings: (input) => creditCardFindings(input, creditCardRule)
};

const myNumberRule: DetectorRule = {
  id: "my_number",
  label: "マイナンバー風文字列",
  riskLevel: "high",
  enabled: true,
  createFindings: (input) => myNumberFindings(input, myNumberRule)
};

const postalCodeRule = createRegexRule({
  id: "postal_code",
  label: "郵便番号",
  riskLevel: "low",
  pattern: /\b\d{3}-\d{4}\b/g
});

export function phoneFindings(input: string, rule: DetectorRule): Finding[] {
  const candidates = regexFindings(input, rule, /(?<!\d)0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4}(?!\d)/g);
  return candidates.filter((finding) => {
    const digits = finding.text.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 11;
  });
}

export function creditCardFindings(input: string, rule: DetectorRule): Finding[] {
  const candidates = regexFindings(input, rule, /\b(?:\d[ -]?){13,19}\b/g);
  return candidates.filter((finding) => {
    const digits = finding.text.replace(/\D/g, "");
    return digits.length >= 13 && digits.length <= 19 && luhnCheck(digits);
  });
}

export function myNumberFindings(input: string, rule: DetectorRule): Finding[] {
  const findings: Finding[] = [];
  const contextPattern = /マイナンバー|個人番号/u;
  const linePattern = /[^\r\n]+/g;
  const numberPattern = /(?<!\d)(?:\d{4}[-\s]?\d{4}[-\s]?\d{4})(?!\d)/g;
  let lineMatch: RegExpExecArray | null;

  while ((lineMatch = linePattern.exec(input)) !== null) {
    const line = lineMatch[0];
    if (!contextPattern.test(line)) {
      continue;
    }

    numberPattern.lastIndex = 0;
    let numberMatch: RegExpExecArray | null;
    while ((numberMatch = numberPattern.exec(line)) !== null) {
      const start = lineMatch.index + numberMatch.index;
      findings.push(createRuleFinding(input, rule, start, start + numberMatch[0].length, 0.85));
    }
  }

  return findings;
}

export const piiDetectorRules: DetectorRule[] = [
  emailRule,
  phoneRule,
  creditCardRule,
  myNumberRule,
  postalCodeRule
];
