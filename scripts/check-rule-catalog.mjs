import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(".");

const paths = {
  guide: "docs/detection-rule-authoring.md",
  rules: "packages/core/src/rules.ts",
  ruleHelpers: "packages/core/src/ruleHelpers.ts",
  remoteSchema: "packages/core/src/remoteRuleSchema.ts",
  ruleDelivery: "docs/rule-delivery.md",
  operations: "docs/rule-delivery-operations.md",
  readme: "README.md"
};

function fail(message) {
  throw new Error(`Rule catalog QA failed: ${message}`);
}

function read(relativePath) {
  return readFileSync(resolve(rootDir, relativePath), "utf8");
}

function assertIncludes(text, needle, context) {
  if (!text.includes(needle)) {
    fail(`${context} must include: ${needle}`);
  }
}

for (const path of Object.values(paths)) {
  if (!existsSync(resolve(rootDir, path))) {
    fail(`${path} is missing`);
  }
}

const guide = read(paths.guide);
const rulesSource = read(paths.rules);
const helperSource = read(paths.ruleHelpers);
const remoteSchema = read(paths.remoteSchema);
const ruleDelivery = read(paths.ruleDelivery);
const operations = read(paths.operations);
const readme = read(paths.readme);

const ruleIds = Array.from(rulesSource.matchAll(/id:\s*"([^"]+)"/gu)).map((match) => match[1]);
if (ruleIds.length < 17) {
  fail(`expected at least 17 bundled rules, got ${ruleIds.length}`);
}

for (const ruleId of ruleIds) {
  assertIncludes(guide, `\`${ruleId}\``, paths.guide);
}

const placeholderPairs = Array.from(helperSource.matchAll(/\s([a-z0-9_]+):\s*"([A-Z0-9_]+)"/gu));
if (placeholderPairs.length < ruleIds.length) {
  fail("placeholderByRuleId appears to be missing entries");
}

for (const [, ruleId, prefix] of placeholderPairs) {
  assertIncludes(guide, `\`${ruleId}\``, paths.guide);
  assertIncludes(guide, `[${prefix}_1]`, paths.guide);
}

for (const phrase of [
  "RemoteDetectorRuleDefinition",
  "remote:<id>",
  "detectSensitiveText(input, { extraRules })",
  "placeholderPrefix",
  "riskLevel",
  "category",
  "message",
  "confidence",
  "schema",
  "payload.version",
  "generatedAt",
  "minExtensionVersion",
  "ReDoS",
  "誤検出",
  "過検出",
  "ロールバック",
  "署名付き配信前レビュー",
  "pnpm qa:rule-catalog",
  "pnpm test:core",
  "pnpm test:worker",
  "ユーザー本文",
  "実secret",
  "同梱ルールへフォールバック"
]) {
  assertIncludes(guide, phrase, paths.guide);
}

for (const field of ["id", "label", "riskLevel", "category", "placeholderPrefix", "pattern", "flags", "message", "confidence", "enabled"]) {
  assertIncludes(remoteSchema, field, paths.remoteSchema);
  assertIncludes(guide, field, paths.guide);
}

for (const phrase of ["detection-rule-authoring.md", "検出ルール作成ガイド"]) {
  assertIncludes(ruleDelivery, phrase, paths.ruleDelivery);
  assertIncludes(operations, phrase, paths.operations);
  assertIncludes(readme, phrase, paths.readme);
}

console.log("Rule catalog QA passed");
