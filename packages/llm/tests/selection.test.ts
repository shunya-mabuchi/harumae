import { describe, expect, it } from "vitest";
import {
  DEFAULT_SELECTED_CONTEXT_CANDIDATE_CONFIDENCE,
  selectContextCandidateIdsByConfidence,
  type ContextRiskCandidate
} from "../src";

function candidate(id: string, confidence: number): ContextRiskCandidate {
  return {
    id,
    category: "person_name",
    surface: "山田花子さん",
    label: "人名候補",
    reason: "採用文脈に含まれる人名候補です。",
    riskLevel: "medium",
    suggestedPlaceholder: "[PERSON_1]",
    confidence
  };
}

describe("selectContextCandidateIdsByConfidence", () => {
  it("既定ではconfidence 0.75以上の候補IDだけを返す", () => {
    const selectedIds = selectContextCandidateIdsByConfidence([
      candidate("low", 0.74),
      candidate("border", DEFAULT_SELECTED_CONTEXT_CANDIDATE_CONFIDENCE),
      candidate("high", 0.9)
    ]);

    expect(selectedIds).toEqual(["border", "high"]);
  });

  it("しきい値を指定できる", () => {
    const selectedIds = selectContextCandidateIdsByConfidence(
      [candidate("mid", 0.7), candidate("high", 0.9)],
      0.8
    );

    expect(selectedIds).toEqual(["high"]);
  });

  it("候補が空なら空配列を返す", () => {
    expect(selectContextCandidateIdsByConfidence([])).toEqual([]);
  });
});
