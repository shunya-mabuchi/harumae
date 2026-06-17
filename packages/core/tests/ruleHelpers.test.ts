import { describe, expect, it } from "vitest";
import type { DetectorRule } from "../src/types";
import { createRuleFinding, luhnCheck, regexFindings } from "../src/ruleHelpers";

const emailRule: DetectorRule = {
  id: "email",
  label: "メールアドレス",
  riskLevel: "high",
  enabled: true,
  createFindings: () => []
};

describe("ruleHelpers", () => {
  it("ルール情報からFindingの基本フィールドを組み立てる", () => {
    const finding = createRuleFinding("連絡先は taro@example.com です。", emailRule, 5, 21);

    expect(finding).toMatchObject({
      id: "rule:email:5:21",
      ruleId: "email",
      source: "rule",
      label: "メールアドレス",
      riskLevel: "high",
      text: "taro@example.com",
      placeholder: "[EMAIL_1]",
      message: "外部へ送る前に強く確認したい情報です。",
      confidence: 0.95
    });
  });

  it("空文字一致はFinding化せず次の一致へ進む", () => {
    const findings = regexFindings("abc", emailRule, /(?=a)|b/g);

    expect(findings.map((finding) => finding.text)).toEqual(["b"]);
  });

  it("Luhnチェックでカード番号候補を判定する", () => {
    expect(luhnCheck("4111111111111111")).toBe(true);
    expect(luhnCheck("4111111111111112")).toBe(false);
  });
});
