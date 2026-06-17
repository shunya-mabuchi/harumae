import type { Finding } from "@ai-mae-check/core";
import { createPasteReviewFindingView } from "./pasteReviewFindingView";

export const PASTE_REVIEW_FINDING_EMPTY_MESSAGE = "検出項目はありません。";

export interface PasteReviewFindingListItemView {
  id: string;
  selected: boolean;
  label: string;
  text: string;
  message: string;
  riskBadgeClassName: string;
  riskBadgeText: string;
  sourceLabel: string;
  selectionLabel: string;
}

export interface PasteReviewFindingListView {
  emptyMessage?: string;
  items: PasteReviewFindingListItemView[];
}

export function createPasteReviewFindingListView(
  findings: Finding[],
  selectedFindingIds: Set<string>
): PasteReviewFindingListView {
  if (findings.length === 0) {
    return {
      emptyMessage: PASTE_REVIEW_FINDING_EMPTY_MESSAGE,
      items: []
    };
  }

  return {
    items: findings.map((finding) => {
      const selected = selectedFindingIds.has(finding.id);
      const view = createPasteReviewFindingView(finding, selected);
      return {
        id: finding.id,
        selected,
        label: finding.label,
        text: finding.text,
        message: finding.message,
        riskBadgeClassName: view.riskBadgeClassName,
        riskBadgeText: view.riskBadgeText,
        sourceLabel: view.sourceLabel,
        selectionLabel: view.selectionLabel
      };
    })
  };
}
