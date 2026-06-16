import { afterEach, describe, expect, it, vi } from "vitest";
import { createLlmContextAnalyzer, DEFAULT_MODEL_ID } from "../src";

const createEngineMock = vi.fn(async () => ({
  chat: {
    completions: {
      create: vi.fn(async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                candidates: [],
                summary: "追加候補はありません。"
              })
            }
          }
        ]
      }))
    }
  }
}));

vi.mock("@mlc-ai/web-llm", () => ({
  CreateWebWorkerMLCEngine: createEngineMock,
  prebuiltAppConfig: {
    model_list: [{ model_id: DEFAULT_MODEL_ID }]
  }
}));

class TestWorker {
  constructor(
    public readonly url: string,
    public readonly options?: WorkerOptions
  ) {}

  terminate() {}
}

describe("WebGPU事前チェック", () => {
  afterEach(() => {
    createEngineMock.mockClear();
    vi.unstubAllGlobals();
  });

  it("requestAdapterがnullでもWorker側のWebLLM初期化を試す", async () => {
    const requestAdapter = vi.fn(async () => null);
    vi.stubGlobal("navigator", { gpu: { requestAdapter } });
    vi.stubGlobal("Worker", TestWorker);

    const analyzer = createLlmContextAnalyzer({ workerUrl: "/llm-worker.js" });
    const result = await analyzer.analyze("A社向けの提案です。");

    expect(requestAdapter).toHaveBeenCalled();
    expect(result.errorDetail).toBeUndefined();
    expect(result.error).toBeUndefined();
    expect(createEngineMock).toHaveBeenCalledWith(expect.any(TestWorker), DEFAULT_MODEL_ID, expect.any(Object));
    expect(result.summary).toBe("追加候補はありません。");
  });
});
