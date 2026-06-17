import type { RiskDecisionLevel, RiskLevel } from "@ai-mae-check/core";

export const findingRiskLabels: Record<RiskLevel, string> = {
  critical: "重大",
  high: "高",
  medium: "中",
  low: "低"
};

export const decisionRiskLabels: Record<RiskDecisionLevel, string> = {
  safe: "安全寄り",
  low: "低",
  medium: "中",
  high: "高",
  critical: "重大"
};
