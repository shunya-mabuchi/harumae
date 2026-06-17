import type { RiskLevel } from "@ai-mae-check/core";
import type { PasteReviewModalMode } from "./pasteReviewModalCopy";
import { findingRiskLabels } from "./riskLabels";

export interface PasteReviewActionState {
  rawButtonText: string;
  rawButtonDisabled: boolean;
  rawButtonTitle: string;
  footerNote: string;
}

export const RAW_PASTE_BLOCKED_MESSAGE = "高リスクまたはSecret Guard対象のため、そのまま貼り付けはできません。";

export const pasteReviewRiskLabel: Record<RiskLevel, string> = findingRiskLabels;

export function createPasteReviewActionState(rawPasteAllowed: boolean): PasteReviewActionState {
  return {
    rawButtonText: rawPasteAllowed ? "そのまま貼り付け" : "そのまま貼り付け（不可）",
    rawButtonDisabled: !rawPasteAllowed,
    rawButtonTitle: rawPasteAllowed ? "" : RAW_PASTE_BLOCKED_MESSAGE,
    footerNote: rawPasteAllowed ? "" : RAW_PASTE_BLOCKED_MESSAGE
  };
}

export function shouldDisablePasteReviewMaskAction(mode: PasteReviewModalMode, selectedFindingCount: number): boolean {
  return mode === "context_check" && selectedFindingCount === 0;
}
