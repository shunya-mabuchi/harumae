import type { ContextRiskCandidate } from "./types";

export const DEFAULT_SELECTED_CONTEXT_CANDIDATE_CONFIDENCE = 0.75;

export function selectContextCandidateIdsByConfidence(
  candidates: ContextRiskCandidate[],
  minConfidence = DEFAULT_SELECTED_CONTEXT_CANDIDATE_CONFIDENCE
): string[] {
  return candidates.filter((candidate) => candidate.confidence >= minConfidence).map((candidate) => candidate.id);
}
