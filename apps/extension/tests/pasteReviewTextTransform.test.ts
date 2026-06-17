import { detectSensitiveText } from "@ai-mae-check/core";
import { describe, expect, it } from "vitest";
import { createPasteReviewInsertText, createPasteReviewPreviewText } from "../src/lib/pasteReviewTextTransform";

describe("pasteReviewTextTransform", () => {
  const input = "メールは taro@example.com です。";
  const findings = detectSensitiveText(input).findings;

  it("プレビューはモードに関係なくplaceholderマスクを返す", () => {
    expect(createPasteReviewPreviewText(input, findings)).toBe("メールは [EMAIL_1] です。");
  });

  it("通常モードの挿入テキストはplaceholderマスクを返す", () => {
    expect(createPasteReviewInsertText(input, findings, "default")).toBe("メールは [EMAIL_1] です。");
  });

  it("paste_guardモードの挿入テキストは汎用表現へ変換する", () => {
    expect(createPasteReviewInsertText(input, findings, "paste_guard")).toBe("メールは [メールアドレス] です。");
  });

  it("context_checkモードの挿入テキストは候補マスクを返す", () => {
    expect(createPasteReviewInsertText(input, findings, "context_check")).toBe("メールは [EMAIL_1] です。");
  });
});
