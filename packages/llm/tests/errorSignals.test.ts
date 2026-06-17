import { describe, expect, it } from "vitest";
import {
  classifyLlmErrorSignal,
  createJsonParseFallbackMessage,
  isJsonParseLlmErrorMessage
} from "../src/errorSignals";

describe("errorSignals", () => {
  it("モデル取得失敗の生メッセージを分類する", () => {
    const signal = classifyLlmErrorSignal("Failed to fetch https://huggingface.co/mlc-ai/model");

    expect(signal.kind).toBe("model_fetch");
    expect(signal.message).toContain("ローカルAIモデルの取得に失敗しました");
    expect(signal.hint).toContain("Hugging Face");
  });

  it("WebGPUアダプタ未取得とGPU実行中断を別の文言へ分類する", () => {
    const adapterSignal = classifyLlmErrorSignal("No available WebGPU adapters");
    const runtimeSignal = classifyLlmErrorSignal(
      "AbortError: Failed to execute 'mapAsync' on 'GPUBuffer': Buffer was unmapped before mapping was resolved."
    );

    expect(adapterSignal.kind).toBe("webgpu");
    expect(adapterSignal.message).toContain("WebGPUアダプタを取得できません");
    expect(adapterSignal.hint).toContain("モデルを変更しても解消しません");
    expect(runtimeSignal.kind).toBe("webgpu");
    expect(runtimeSignal.message).toContain("GPU実行が中断されました");
    expect(runtimeSignal.hint).toContain("Chromeの完全再起動");
  });

  it("Worker寿命系とJSON読み取り失敗を分類する", () => {
    const workerSignal = classifyLlmErrorSignal("Object has already been disposed");
    const jsonSignal = classifyLlmErrorSignal("AI文脈チェックの出力形式は読み取れませんでした");

    expect(workerSignal.kind).toBe("worker");
    expect(workerSignal.hint).toContain("破棄済み");
    expect(jsonSignal.kind).toBe("json_parse");
    expect(isJsonParseLlmErrorMessage("JSON parse failed while reading WebLLM output")).toBe(true);
  });

  it("JSON読み取り失敗の非致命フォールバック文言を候補数から返す", () => {
    expect(createJsonParseFallbackMessage(0)).toBe(
      "ルールベース検出結果で安全化できます。AI文脈チェックは必要に応じて再実行してください。"
    );
    expect(createJsonParseFallbackMessage(1)).toBe(
      "ブラウザ内の補助検出で注意候補を確認しました。安全化対象を選んで続行できます。"
    );
  });
});
