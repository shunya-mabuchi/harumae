import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createContentGuardContext } from "../src/content/contentReview";
import { handlePaste, installPasteInterceptor } from "../src/content/dom/pasteInterceptor";
import { DEFAULT_SETTINGS } from "../src/lib/settings";

class FakeElement extends EventTarget {}

class FakeInputElement extends FakeElement {}

class FakeTextAreaElement extends FakeElement {
  disabled = false;
  readOnly = false;
  selectionStart = 0;
  selectionEnd = 0;

  constructor(public value: string) {
    super();
  }

  setSelectionRange(start: number, end: number): void {
    this.selectionStart = start;
    this.selectionEnd = end;
  }
}

class FakeInputEvent extends Event {
  constructor(
    type: string,
    readonly options: InputEventInit
  ) {
    super(type, options);
  }
}

class FakeRoot {
  readonly listeners = new Set<(event: ClipboardEvent) => void>();

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (type === "paste" && typeof listener === "function") {
      this.listeners.add(listener as (event: ClipboardEvent) => void);
    }
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (type === "paste" && typeof listener === "function") {
      this.listeners.delete(listener as (event: ClipboardEvent) => void);
    }
  }
}

function createPasteEvent(text: string, target: EventTarget): ClipboardEvent {
  return {
    target,
    defaultPrevented: false,
    clipboardData: {
      getData: (type: string) => (type === "text/plain" ? text : "")
    },
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation: vi.fn()
  } as unknown as ClipboardEvent;
}

function createGuardContext() {
  return createContentGuardContext({
    settings: DEFAULT_SETTINGS,
    remoteRules: []
  });
}

describe("pasteInterceptor", () => {
  beforeEach(() => {
    vi.stubGlobal("Element", FakeElement);
    vi.stubGlobal("HTMLInputElement", FakeInputElement);
    vi.stubGlobal("HTMLTextAreaElement", FakeTextAreaElement);
    vi.stubGlobal("InputEvent", FakeInputEvent);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("レビュー対象のpasteを止め、選択位置へレビュー後テキストを挿入する", async () => {
    const editor = new FakeTextAreaElement("hello world");
    editor.setSelectionRange(6, 11);
    const review = vi.fn().mockResolvedValue({
      type: "insert",
      text: "[メールアドレス]"
    });

    const event = createPasteEvent("taro@example.com", editor);
    await handlePaste(event, {
      isEnabled: () => true,
      getGuardContext: createGuardContext,
      review
    });

    expect(review).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
    expect(editor.value).toBe("hello [メールアドレス]");
  });

  it("許可されたpasteと無効時は介入しない", async () => {
    const editor = new FakeTextAreaElement("");
    const review = vi.fn();

    const disabledEvent = createPasteEvent("taro@example.com", editor);
    await handlePaste(disabledEvent, {
      isEnabled: () => false,
      getGuardContext: createGuardContext,
      review
    });

    const allowedEvent = createPasteEvent("今日は天気がよいです。", editor);
    await handlePaste(allowedEvent, {
      isEnabled: () => true,
      getGuardContext: createGuardContext,
      review
    });

    expect(disabledEvent.defaultPrevented).toBe(false);
    expect(allowedEvent.defaultPrevented).toBe(false);
    expect(review).not.toHaveBeenCalled();
  });

  it("install後にcleanupするとpaste listenerを解除する", () => {
    const root = new FakeRoot();

    const cleanup = installPasteInterceptor({
      isEnabled: () => false,
      getGuardContext: createGuardContext,
      review: vi.fn(),
      root: root as unknown as Document
    });

    expect(root.listeners.size).toBe(1);
    cleanup();
    expect(root.listeners.size).toBe(0);
  });
});
