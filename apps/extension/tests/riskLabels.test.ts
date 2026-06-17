import { describe, expect, it } from "vitest";
import { decisionRiskLabels, findingRiskLabels } from "../src/lib/riskLabels";

describe("riskLabels", () => {
  it("送信前判定のリスク表示を返す", () => {
    expect(decisionRiskLabels).toEqual({
      safe: "安全寄り",
      low: "低",
      medium: "中",
      high: "高",
      critical: "重大"
    });
  });

  it("検出項目のリスク表示を返す", () => {
    expect(findingRiskLabels).toEqual({
      low: "低",
      medium: "中",
      high: "高",
      critical: "重大"
    });
  });
});
