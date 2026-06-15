const CONTEXT_HINTS = [
  "nda",
  "confidential",
  "社外秘",
  "秘密",
  "取扱注意",
  "関係者限り",
  "未公開",
  "口外禁止",
  "正式発表前",
  "社外共有",
  "社内だけ",
  "社内限り",
  "顧客",
  "提案",
  "見積",
  "契約",
  "契約更新",
  "給与",
  "採用",
  "候補者",
  "面談",
  "評価メモ",
  "内定",
  "役員会",
  "案件",
  "プロジェクト"
];

const MIN_CONTEXT_CHECK_CHARS = 40;

export function shouldOfferContextCheck(inputText: string): boolean {
  const normalized = inputText.trim().toLowerCase();
  if (normalized.length < MIN_CONTEXT_CHECK_CHARS) {
    return false;
  }

  return CONTEXT_HINTS.some((hint) => normalized.includes(hint));
}
