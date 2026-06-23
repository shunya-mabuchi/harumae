import { createRegexRule } from "../regexRuleFactory";
import type { DetectorRule } from "../types";

export const technicalDetectorRules: DetectorRule[] = [
  createRegexRule({
    id: "url",
    label: "URL",
    riskLevel: "medium",
    pattern: /\bhttps?:\/\/[^\s<>"'）)]+/gi
  }),
  createRegexRule({
    id: "ip_address",
    label: "IPv4アドレス",
    riskLevel: "medium",
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g
  }),
  createRegexRule({
    id: "date",
    label: "日付",
    riskLevel: "low",
    pattern: /\b\d{4}[/. -]\d{1,2}[/. -]\d{1,2}\b|(?:\d{4}年)?\d{1,2}月\d{1,2}日/g
  }),
  createRegexRule({
    id: "long_id",
    label: "長いID風文字列",
    riskLevel: "low",
    pattern: /\b(?=[A-Za-z0-9]*[A-Za-z])(?=[A-Za-z0-9]*\d)[A-Za-z0-9]{16,}\b/g
  })
];
