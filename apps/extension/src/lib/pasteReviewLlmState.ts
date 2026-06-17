import type { LlmErrorDetail } from "@ai-mae-check/llm";
import type { PasteReviewModalMode } from "./pasteReviewModalCopy";
import type { AiMaeCheckSettings } from "./settings";

export const PASTE_REVIEW_LLM_INITIAL_MESSAGE = "AI文脈チェックは手動で実行できます。";
export const PASTE_REVIEW_LLM_DISABLED_MESSAGE = "設定でAI文脈チェックが無効になっています。";
export const PASTE_REVIEW_LLM_LOADING_MESSAGE =
  "ローカルAIモデルを準備しています。初回のみ時間がかかる場合があります。";
export const PASTE_REVIEW_LLM_UNREADABLE_OUTPUT_MESSAGE =
  "ルールベース検出結果で安全化できます。AI文脈チェックは必要に応じて再実行してください。";
export const PASTE_REVIEW_LLM_UNREADABLE_OUTPUT_WITH_FALLBACK_MESSAGE =
  "ブラウザ内の補助検出で注意候補を確認しました。安全化対象を選んで続行できます。";

export function createPasteReviewLlmCompleteMessage(candidateCount: number, summary?: string): string {
  const normalizedSummary = summary?.trim() ?? "";
  if (
    normalizedSummary.includes("AI文脈チェックの出力形式は読み取れませんでした") ||
    normalizedSummary.includes("AI文脈チェックの結果を読み取れませんでした")
  ) {
    return candidateCount > 0
      ? PASTE_REVIEW_LLM_UNREADABLE_OUTPUT_WITH_FALLBACK_MESSAGE
      : PASTE_REVIEW_LLM_UNREADABLE_OUTPUT_MESSAGE;
  }

  return candidateCount > 0
    ? "AI文脈チェックで注意候補が見つかりました。"
    : "AI文脈チェックでは追加の注意候補は見つかりませんでした。ただし、安全を保証するものではありません。";
}

export function createPasteReviewLlmResultMessage(
  candidateCount: number,
  summary?: string,
  detail?: LlmErrorDetail
): string {
  if (detail?.kind === "json_parse") {
    return candidateCount > 0
      ? PASTE_REVIEW_LLM_UNREADABLE_OUTPUT_WITH_FALLBACK_MESSAGE
      : PASTE_REVIEW_LLM_UNREADABLE_OUTPUT_MESSAGE;
  }

  return createPasteReviewLlmCompleteMessage(candidateCount, summary);
}

export function formatPasteReviewLlmStatusMessage(message: string, detail?: LlmErrorDetail): string {
  if (!detail) {
    return message;
  }

  const technical = detail.technicalDetail ? `\n詳細: ${detail.technicalDetail}` : "";
  return `${message}\n診断メモ: ${detail.hint}${technical}`;
}

export function shouldAutoRunPasteReviewLlm(
  mode: PasteReviewModalMode,
  llmSettings: AiMaeCheckSettings["llm"]
): boolean {
  return mode === "default" && llmSettings.enabled && llmSettings.mode === "auto";
}
