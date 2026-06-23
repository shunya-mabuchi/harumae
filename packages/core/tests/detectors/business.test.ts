import { describe, expect, it } from "vitest";
import type { DetectorRule } from "../../src/types";
import { confidentialLineFindings, internalUrlFindings } from "../../src/detectors";

function rule(id: string, label = id): DetectorRule {
  return {
    id,
    label,
    riskLevel: "medium",
    enabled: true,
    createFindings: () => []
  };
}

describe("business detectors", () => {
  it("注意語を含む行全体を返す", () => {
    const findings = confidentialLineFindings(
      "公開情報です。\nA社向け資料はNDA締結前なので関係者限りです。",
      rule("confidential_text", "社外秘・注意語を含む文")
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.text).toBe("A社向け資料はNDA締結前なので関係者限りです。");
    expect(findings[0]?.confidence).toBe(0.9);
  });

  it("社内URLらしいURLと重なったドメイン候補を返す", () => {
    const findings = internalUrlFindings(
      "公開 https://example.com と 社内 https://staging.example.local/path と localhost:3000",
      rule("internal_url", "社内URLっぽいもの")
    );

    expect(findings.map((finding) => finding.text)).toEqual([
      "https://staging.example.local/path",
      "staging.example.local/path",
      "localhost"
    ]);
  });
});
