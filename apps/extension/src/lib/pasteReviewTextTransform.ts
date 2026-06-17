import { maskSensitiveText, transformText, type Finding } from "@ai-mae-check/core";
import type { PasteReviewModalMode } from "./pasteReviewModalCopy";

export function createPasteReviewPreviewText(inputText: string, findings: Finding[]): string {
  return maskSensitiveText(inputText, findings).maskedText;
}

export function createPasteReviewInsertText(
  inputText: string,
  findings: Finding[],
  mode: PasteReviewModalMode
): string {
  return mode === "paste_guard"
    ? transformText(inputText, findings, "generalize").transformedText
    : maskSensitiveText(inputText, findings).maskedText;
}
