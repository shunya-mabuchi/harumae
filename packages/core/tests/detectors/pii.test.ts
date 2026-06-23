import { describe, expect, it } from "vitest";
import type { DetectorRule } from "../../src/types";
import { creditCardFindings, myNumberFindings, phoneFindings } from "../../src/detectors";

function rule(id: string, label = id): DetectorRule {
  return {
    id,
    label,
    riskLevel: "high",
    enabled: true,
    createFindings: () => []
  };
}

describe("pii detectors", () => {
  it("日本の電話番号らしい候補だけを返す", () => {
    const findings = phoneFindings("電話 090-1234-5678 / 短い番号 03-12", rule("phone", "日本の電話番号"));

    expect(findings).toHaveLength(1);
    expect(findings[0]?.text).toBe("090-1234-5678");
  });

  it("Luhnチェックに通るカード番号だけを返す", () => {
    const findings = creditCardFindings(
      "候補 4111 1111 1111 1111 と 4111 1111 1111 1112",
      rule("credit_card", "クレジットカード風番号")
    );

    expect(findings.map((finding) => finding.text)).toEqual(["4111 1111 1111 1111"]);
  });

  it("文脈語がある場合だけマイナンバー風文字列を返す", () => {
    const findings = myNumberFindings("個人番号は 1234-5678-9012 です。", rule("my_number", "マイナンバー風文字列"));
    const falsePositive = myNumberFindings("注文番号は 1234-5678-9012 です。", rule("my_number", "マイナンバー風文字列"));

    expect(findings).toHaveLength(1);
    expect(findings[0]?.text).toBe("1234-5678-9012");
    expect(falsePositive).toHaveLength(0);
  });
});
