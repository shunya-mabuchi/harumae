import type { DetectionSummary, RiskLevel } from "@ai-mae-check/core";

export interface PasteReviewSummaryItem {
  level: RiskLevel;
  label: string;
  count: number;
  className: string;
  text: string;
}

const summaryDisplayOrder: Array<{
  level: RiskLevel;
  label: string;
  summaryKey: keyof Pick<DetectionSummary, "critical" | "high" | "medium" | "low">;
}> = [
  { level: "critical", label: "重大リスク件数", summaryKey: "critical" },
  { level: "high", label: "高リスク件数", summaryKey: "high" },
  { level: "medium", label: "中リスク件数", summaryKey: "medium" },
  { level: "low", label: "低リスク件数", summaryKey: "low" }
];

export function createPasteReviewSummaryItems(summary: DetectionSummary): PasteReviewSummaryItem[] {
  return summaryDisplayOrder.map(({ level, label, summaryKey }) => {
    const count = summary[summaryKey];
    return {
      level,
      label,
      count,
      className: `hm-count hm-${level}`,
      text: `${label}\n${count}`
    };
  });
}
