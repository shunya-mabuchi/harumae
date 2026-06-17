import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = resolve(__dirname, "../../..");
const workflowPath = resolve(rootDir, ".github/workflows/ci.yml");

describe("GitHub Actions CI", () => {
  it("PRとmain更新で公開前の主要チェックを実行する", () => {
    expect(existsSync(workflowPath)).toBe(true);

    const workflow = readFileSync(workflowPath, "utf8");

    expect(workflow).toContain("name: CI");
    expect(workflow).toContain("pull_request:");
    expect(workflow).toContain("push:");
    expect(workflow).toContain("branches: [main]");
    expect(workflow).toContain("pnpm install --frozen-lockfile");
    expect(workflow).toContain("pnpm typecheck");
    expect(workflow).toContain("pnpm test");
    expect(workflow).toContain("pnpm build");
    expect(workflow).toContain("pnpm package:extension");
    expect(workflow).toContain("pnpm qa:extension:manifest");
    expect(workflow).toContain("pnpm qa:chrome-store");
  });
});
