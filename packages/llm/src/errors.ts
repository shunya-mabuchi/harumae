import {
  classifyLlmErrorSignal,
  isJsonParseLlmErrorMessage as isJsonParseSignalMessage,
  type LlmErrorSignal
} from "./errorSignals";
import type { ContextAnalysisResult, LlmErrorDetail } from "./types";
export { createJsonParseFallbackMessage, isJsonParseLlmErrorMessage } from "./errorSignals";

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "";
}

function sanitizeTechnicalDetail(message: string): string | undefined {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (normalized.length === 0) {
    return undefined;
  }

  return normalized.slice(0, 260);
}

function detail(signal: LlmErrorSignal, rawMessage: string): LlmErrorDetail {
  const technicalDetail = sanitizeTechnicalDetail(rawMessage);
  return {
    ...signal,
    ...(technicalDetail ? { technicalDetail } : {})
  };
}

export function classifyLlmError(error: unknown): LlmErrorDetail {
  const message = errorMessage(error);
  return detail(classifyLlmErrorSignal(message), message);
}

export function formatLlmErrorMessage(error: unknown): string {
  return classifyLlmError(error).message;
}

export function isContextAnalysisExecutionError(result: Pick<ContextAnalysisResult, "error" | "errorDetail">): boolean {
  if (!result.error) {
    return false;
  }

  return result.errorDetail?.kind !== "json_parse" && !isJsonParseSignalMessage(result.error);
}
