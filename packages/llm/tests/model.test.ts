import { describe, expect, it } from "vitest";
import {
  COMPATIBLE_LIGHTWEIGHT_MODEL_ID,
  DEFAULT_MODEL_ID,
  LEGACY_LIGHTWEIGHT_MODEL_ID,
  LOW_VRAM_MODEL_ID,
  resolveModelId
} from "../src";

describe("resolveModelId", () => {
  it("legacy f16指定をq4f32互換モデルへ正規化する", () => {
    const modelId = resolveModelId(
      {
        prebuiltAppConfig: {
          model_list: [{ model_id: COMPATIBLE_LIGHTWEIGHT_MODEL_ID }]
        }
      },
      LEGACY_LIGHTWEIGHT_MODEL_ID
    );

    expect(modelId).toBe(COMPATIBLE_LIGHTWEIGHT_MODEL_ID);
  });

  it("標準モデルがない場合は低VRAMモデルへfallbackする", () => {
    const modelId = resolveModelId(
      {
        prebuiltAppConfig: {
          model_list: [{ model_id: LOW_VRAM_MODEL_ID, vram_required_MB: 579.61 }]
        }
      },
      DEFAULT_MODEL_ID
    );

    expect(modelId).toBe(LOW_VRAM_MODEL_ID);
  });

  it("prebuilt一覧に標準モデルがない場合は最も軽いInstruct/Chatモデルへfallbackする", () => {
    const modelId = resolveModelId(
      {
        prebuiltAppConfig: {
          model_list: [
            { model_id: "Large-Instruct-q4f32_1-MLC", vram_required_MB: 5000 },
            { model_id: "Small-Chat-q4f32_1-MLC", vram_required_MB: 300 }
          ]
        }
      },
      "missing-model"
    );

    expect(modelId).toBe("Small-Chat-q4f32_1-MLC");
  });
});
