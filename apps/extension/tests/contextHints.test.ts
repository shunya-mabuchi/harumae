import { describe, expect, it } from "vitest";
import { shouldOfferContextCheck } from "../src/content/dom/contextHints";

describe("contextHints", () => {
  it("契約・採用などの文脈リスクを含む長めの文章ではAI文脈チェック入口を出す", () => {
    const inputText = [
      "A社の佐藤様向けに、Project Blue Bridge の提案メモを作成します。",
      "まだ正式発表前なので、社外共有はしない前提でお願いします。",
      "候補者の山田花子さんについて、最終面談後の評価メモも含めます。",
      "給与条件は内定前に社内だけで確認したいです。"
    ].join("\n");

    expect(shouldOfferContextCheck(inputText)).toBe(true);
  });

  it("短い日常文ではAI文脈チェック入口を出さない", () => {
    expect(shouldOfferContextCheck("今日は天気がよいので、あとでメモを整理します。")).toBe(false);
  });

  it("長くても文脈リスクのヒント語がなければAI文脈チェック入口を出さない", () => {
    const inputText = "この文章は公開済みの一般的な説明文です。ブラウザ上で入力の挙動を確認するためのダミーテキストです。";

    expect(shouldOfferContextCheck(inputText)).toBe(false);
  });
});
