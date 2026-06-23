import { describe, expect, it } from "vitest";
import {
  categorizedDetectorRules,
  createOrderedDetectorRules,
  DEFAULT_DETECTOR_RULE_ORDER
} from "../../src/detectors";

describe("detector registry", () => {
  it("カテゴリ別ルールと既定順序が1対1で対応している", () => {
    const categoryRuleIds = Object.values(categorizedDetectorRules)
      .flat()
      .map((rule) => rule.id)
      .sort();
    const orderedRuleIds = [...DEFAULT_DETECTOR_RULE_ORDER].sort();

    expect(orderedRuleIds).toEqual(categoryRuleIds);
  });

  it("既定順序に従ってdetectorRulesを作る", () => {
    const orderedRules = createOrderedDetectorRules();

    expect(orderedRules.map((rule) => rule.id)).toEqual([...DEFAULT_DETECTOR_RULE_ORDER]);
  });
});
