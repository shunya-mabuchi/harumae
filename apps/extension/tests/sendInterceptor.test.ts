import { describe, expect, it } from "vitest";
import { createSubmitBypass, isDefaultSendKeyboardEvent } from "../src/content/dom/sendInterceptor";

describe("sendInterceptor", () => {
  it("bypass flag is consumed once to avoid submit loops", () => {
    const bypass = createSubmitBypass();

    expect(bypass.consume()).toBe(false);
    bypass.arm();
    expect(bypass.consume()).toBe(true);
    expect(bypass.consume()).toBe(false);
  });

  it("Enter送信を検出し、Shift+EnterとIME入力中は除外する", () => {
    expect(isDefaultSendKeyboardEvent({ key: "Enter", shiftKey: false, altKey: false, isComposing: false })).toBe(true);
    expect(isDefaultSendKeyboardEvent({ key: "Enter", shiftKey: true, altKey: false, isComposing: false })).toBe(false);
    expect(isDefaultSendKeyboardEvent({ key: "Enter", shiftKey: false, altKey: false, isComposing: true })).toBe(false);
    expect(isDefaultSendKeyboardEvent({ key: "a", shiftKey: false, altKey: false, isComposing: false })).toBe(false);
  });
});
