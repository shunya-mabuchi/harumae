import { DEFAULT_CONFIDENCE_THRESHOLD, DEFAULT_MAX_CANDIDATES } from "./constants";
import { extractJsonObject } from "./jsonExtraction";
import type { ContextRiskCandidate, ContextRiskCategory } from "./types";

const categories: ContextRiskCategory[] = [
  "person_name",
  "company_name",
  "customer_name",
  "project_name",
  "contract_info",
  "hr_info",
  "legal_info",
  "financial_info",
  "internal_info",
  "confidential_context",
  "other"
];

const candidateListKeys = [
  "candidates",
  "risks",
  "riskCandidates",
  "contextRiskCandidates",
  "items",
  "findings",
  "候補",
  "注意候補"
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toCategory(value: unknown): ContextRiskCategory {
  return typeof value === "string" && categories.includes(value as ContextRiskCategory)
    ? (value as ContextRiskCategory)
    : "other";
}

function toRiskLevel(value: unknown): "high" | "medium" | "low" {
  return value === "high" || value === "medium" || value === "low" ? value : "low";
}

function clampConfidence(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function candidateValues(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (!isRecord(parsed)) {
    return [];
  }

  for (const key of candidateListKeys) {
    const value = parsed[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

export interface ParseContextAnalysisOptions {
  maxCandidates?: number;
  confidenceThreshold?: number;
}

export function parseContextAnalysisJson(rawText: string, options: ParseContextAnalysisOptions = {}) {
  const maxCandidates = options.maxCandidates ?? DEFAULT_MAX_CANDIDATES;
  const confidenceThreshold = options.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonObject(rawText, [...candidateListKeys, "summary"]));
  } catch {
    throw new Error("AI文脈チェックの結果を読み取れませんでした");
  }

  if (!isRecord(parsed) && !Array.isArray(parsed)) {
    throw new Error("AI文脈チェックの結果を読み取れませんでした");
  }

  const rawCandidates = candidateValues(parsed);
  const candidates: ContextRiskCandidate[] = [];

  for (const rawCandidate of rawCandidates) {
    if (!isRecord(rawCandidate)) {
      continue;
    }

    const surface = typeof rawCandidate.surface === "string" ? rawCandidate.surface.trim() : "";
    const label = typeof rawCandidate.label === "string" ? rawCandidate.label.trim() : "";
    const reason = typeof rawCandidate.reason === "string" ? rawCandidate.reason.trim() : "";
    const confidence = clampConfidence(rawCandidate.confidence);

    if (surface.length === 0 || confidence < confidenceThreshold) {
      continue;
    }

    candidates.push({
      id: `llm-candidate-${candidates.length + 1}`,
      category: toCategory(rawCandidate.category),
      surface,
      label: label.length > 0 ? label : "文脈リスク候補",
      reason: reason.length > 0 ? reason : "外部に送る前に確認したい候補です。",
      riskLevel: toRiskLevel(rawCandidate.riskLevel),
      suggestedPlaceholder:
        typeof rawCandidate.suggestedPlaceholder === "string" && rawCandidate.suggestedPlaceholder.trim().length > 0
          ? rawCandidate.suggestedPlaceholder.trim()
          : "[CONTEXT_1]",
      confidence
    });

    if (candidates.length >= maxCandidates) {
      break;
    }
  }

  return {
    candidates,
    summary:
      isRecord(parsed) && typeof parsed.summary === "string" && parsed.summary.trim().length > 0
        ? parsed.summary.trim()
        : "AI文脈チェックの追加候補を確認しました。"
  };
}
