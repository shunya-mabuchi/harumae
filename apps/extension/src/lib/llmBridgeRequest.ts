import type { AnalyzeContextOptions } from "@ai-mae-check/llm";
import type { LlmBridgeRequest } from "./llmBridgeMessages";

export interface CreateLlmBridgeAnalyzeRequestOptions
  extends Pick<AnalyzeContextOptions, "existingFindings" | "maxCandidates"> {
  requestId: string;
  inputText: string;
  modelId: string;
}

export function createLlmBridgeAnalyzeRequest(options: CreateLlmBridgeAnalyzeRequestOptions): LlmBridgeRequest {
  return {
    type: "analyze",
    requestId: options.requestId,
    inputText: options.inputText,
    modelId: options.modelId,
    options: {
      ...(options.existingFindings ? { existingFindings: options.existingFindings } : {}),
      ...(typeof options.maxCandidates === "number" ? { maxCandidates: options.maxCandidates } : {})
    }
  };
}
