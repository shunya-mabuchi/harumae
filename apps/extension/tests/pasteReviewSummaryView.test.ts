import { describe, expect, it } from "vitest";
import { createPasteReviewSummaryItems } from "../src/lib/pasteReviewSummaryView";
import type { DetectionSummary } from "@ai-mae-check/core";

function summary(overrides: Partial<DetectionSummary> = {}): DetectionSummary {
  return {
    total: 10,
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
    byRule: {},
    ...overrides
  };
}

describe("createPasteReviewSummaryItems", () => {
  it("重大・高・中・低の順で表示項目を返す", () => {
    const items = createPasteReviewSummaryItems(summary());

    expect(items.map((item) => item.level)).toEqual(["critical", "high", "medium", "low"]);
    expect(items.map((item) => item.label)).toEqual([
      "重大リスク件数",
      "高リスク件数",
      "中リスク件数",
      "低リスク件数"
    ]);
    expect(items.map((item) => item.count)).toEqual([1, 2, 3, 4]);
  });

  it("既存CSS classと表示テキストを返す", () => {
    const items = createPasteReviewSummaryItems(summary({ critical: 0, high: 5, medium: 1, low: 0 }));

    expect(items[0]).toMatchObject({
      className: "hm-count hm-critical",
      text: "重大リスク件数\n0"
    });
    expect(items[1]).toMatchObject({
      className: "hm-count hm-high",
      text: "高リスク件数\n5"
    });
  });
});
