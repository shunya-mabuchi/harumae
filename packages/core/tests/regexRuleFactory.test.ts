import { describe, expect, it } from "vitest";
import { createRegexRule } from "../src/regexRuleFactory";

describe("createRegexRule", () => {
  it("正規表現ベースのDetectorRuleを組み立てる", () => {
    const rule = createRegexRule({
      id: "email",
      label: "メールアドレス",
      riskLevel: "high",
      pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
    });

    const findings = rule.createFindings("連絡先は taro@example.com です。");

    expect(rule.enabled).toBe(true);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "email",
      label: "メールアドレス",
      riskLevel: "high",
      text: "taro@example.com",
      placeholder: "[EMAIL_1]"
    });
  });

  it("同じルールを繰り返し実行してもglobal正規表現のlastIndexに影響されない", () => {
    const rule = createRegexRule({
      id: "postal_code",
      label: "郵便番号",
      riskLevel: "low",
      pattern: /\b\d{3}-\d{4}\b/g
    });

    expect(rule.createFindings("〒100-0001")).toHaveLength(1);
    expect(rule.createFindings("〒150-0001")).toHaveLength(1);
  });
});
