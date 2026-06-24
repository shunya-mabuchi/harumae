import { chromium, expect, test, type BrowserContext, type Locator, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const extensionDir = resolve(here, "../.output-e2e/chrome-mv3");
const sensitiveText = "田中太郎です。メールは taro@example.com、電話番号は 090-1234-5678 です。";
const expectedPasteActionLabel = "安全化して入力";
const expectedSendActionLabel = "安全化して送信";

interface ExtensionTestContext {
  context: BrowserContext;
  userDataDir: string;
}

async function launchExtensionContext(): Promise<ExtensionTestContext> {
  if (!existsSync(extensionDir)) {
    throw new Error("拡張E2E用buildが見つかりません。先に pnpm build:extension:e2e を実行してください。");
  }

  const userDataDir = await mkdtemp(join(tmpdir(), "ai-mae-check-extension-e2e-"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: process.env.EXTENSION_E2E_HEADLESS === "1",
    args: [`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`]
  });

  return { context, userDataDir };
}

async function closeExtensionContext(target: ExtensionTestContext): Promise<void> {
  await target.context.close();
  await rm(target.userDataDir, { recursive: true, force: true });
}

async function openMockComposer(page: Page): Promise<void> {
  await page.goto("/mock-composer.html");
  await expect(page.getByRole("heading", { name: "textarea composer" })).toBeVisible();
}

async function dispatchPaste(locator: Locator, text: string): Promise<void> {
  await locator.focus();
  await locator.evaluate((element, pastedText) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", pastedText);
    const event = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer
    });

    if (!event.clipboardData) {
      Object.defineProperty(event, "clipboardData", { value: dataTransfer });
    }

    element.dispatchEvent(event);
  }, text);
}

async function dispatchEnter(locator: Locator, init: KeyboardEventInit = {}): Promise<void> {
  await locator.focus();
  await locator.evaluate((element, eventInit) => {
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
      ...eventInit
    });
    element.dispatchEvent(event);
  }, init);
}

async function clickPasteSafeInput(page: Page): Promise<void> {
  await expect(page.locator(".hm-dialog")).toBeVisible();
  expect(expectedPasteActionLabel).toBe("安全化して入力");
  await page.locator(".hm-dialog .hm-primary").click();
}

async function clickSendSafeSubmit(page: Page): Promise<void> {
  await expect(page.locator(".amc-dialog")).toBeVisible();
  expect(expectedSendActionLabel).toBe("安全化して送信");
  await page.locator(".amc-dialog .amc-primary").click();
}

async function expectTextareaIsSanitized(editor: Locator): Promise<void> {
  await expect(editor).toHaveValue(/田中太郎/);
  await expect(editor).toHaveValue(/\[メールアドレス\]/);
  await expect(editor).toHaveValue(/\[電話番号\]/);
  await expect(editor).not.toHaveValue(/taro@example\.com/);
  await expect(editor).not.toHaveValue(/090-1234-5678/);
}

async function expectEditableIsSanitized(editor: Locator): Promise<void> {
  await expect(editor).toContainText("田中太郎");
  await expect(editor).toContainText("[メールアドレス]");
  await expect(editor).toContainText("[電話番号]");
  await expect(editor).not.toContainText("taro@example.com");
  await expect(editor).not.toContainText("090-1234-5678");
}

async function fillEditor(editor: Locator, text: string): Promise<void> {
  const tagName = await editor.evaluate((element) => element.tagName.toLowerCase());
  if (tagName === "textarea" || tagName === "input") {
    await editor.fill(text);
    return;
  }

  await editor.evaluate((element, value) => {
    element.textContent = value;
    element.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
  }, text);
}

test.describe("AIまえチェック拡張E2E", () => {
  test("textareaへのpasteを検知し、安全化して貼り付けられる", async () => {
    const target = await launchExtensionContext();
    try {
      const page = await target.context.newPage();
      await openMockComposer(page);

      const editor = page.getByTestId("textarea-editor");
      await dispatchPaste(editor, sensitiveText);
      await clickPasteSafeInput(page);

      await expectTextareaIsSanitized(editor);
    } finally {
      await closeExtensionContext(target);
    }
  });

  test("contenteditableへのpasteを検知し、安全化して貼り付けられる", async () => {
    const target = await launchExtensionContext();
    try {
      const page = await target.context.newPage();
      await openMockComposer(page);

      const editor = page.getByTestId("contenteditable-editor");
      await dispatchPaste(editor, sensitiveText);
      await clickPasteSafeInput(page);

      await expectEditableIsSanitized(editor);
    } finally {
      await closeExtensionContext(target);
    }
  });

  test("Lexical風DOMへのpasteを検知し、安全化して貼り付けられる", async () => {
    const target = await launchExtensionContext();
    try {
      const page = await target.context.newPage();
      await openMockComposer(page);

      const editor = page.getByTestId("lexical-editor");
      await dispatchPaste(editor, sensitiveText);
      await clickPasteSafeInput(page);

      await expectEditableIsSanitized(editor);
    } finally {
      await closeExtensionContext(target);
    }
  });

  test("ProseMirror風DOMへのpasteを検知し、安全化して貼り付けられる", async () => {
    const target = await launchExtensionContext();
    try {
      const page = await target.context.newPage();
      await openMockComposer(page);

      const editor = page.getByTestId("prosemirror-editor");
      await dispatchPaste(editor, sensitiveText);
      await clickPasteSafeInput(page);

      await expectEditableIsSanitized(editor);
    } finally {
      await closeExtensionContext(target);
    }
  });

  test("送信ボタンクリックを送信前確認で止め、安全化してから送信できる", async () => {
    const target = await launchExtensionContext();
    try {
      const page = await target.context.newPage();
      await openMockComposer(page);

      const editor = page.getByTestId("textarea-editor");
      const output = page.getByTestId("submitted-output");
      await editor.fill(sensitiveText);

      await page.getByTestId("send-button").click();
      await expect(output).toHaveAttribute("data-submitted", "false");

      await clickSendSafeSubmit(page);

      await expect(output).toHaveAttribute("data-submitted", "true");
      await expect(output).toContainText("[メールアドレス]");
      await expect(output).toContainText("[電話番号]");
      await expect(output).not.toContainText("taro@example.com");
      await expect(output).not.toContainText("090-1234-5678");
    } finally {
      await closeExtensionContext(target);
    }
  });

  test("通常EnterとCtrl/Meta+Enterの送信前確認を検知する", async () => {
    for (const [name, init] of [
      ["通常Enter", {}],
      ["Ctrl+Enter", { ctrlKey: true }],
      ["Meta+Enter", { metaKey: true }]
    ] satisfies Array<[string, KeyboardEventInit]>) {
      const target = await launchExtensionContext();
      try {
        const page = await target.context.newPage();
        await openMockComposer(page);

        const editor = page.getByTestId("textarea-editor");
        const output = page.getByTestId("submitted-output");
        await editor.fill(`${sensitiveText}\n${name}`);

        await dispatchEnter(editor, init);
        await expect(output).toHaveAttribute("data-submitted", "false");
        await clickSendSafeSubmit(page);

        await expect(output).toHaveAttribute("data-submitted", "true");
        await expect(output).toContainText("[メールアドレス]");
        await expect(output).not.toContainText("taro@example.com");
      } finally {
        await closeExtensionContext(target);
      }
    }
  });

  test("Shift/Alt/IME変換中のEnterは送信扱いにしない", async () => {
    for (const [name, init] of [
      ["Shift+Enter", { shiftKey: true }],
      ["Alt+Enter", { altKey: true }],
      ["IME変換中Enter", { isComposing: true }]
    ] satisfies Array<[string, KeyboardEventInit]>) {
      const target = await launchExtensionContext();
      try {
        const page = await target.context.newPage();
        await openMockComposer(page);

        const editor = page.getByTestId("textarea-editor");
        const output = page.getByTestId("submitted-output");
        await fillEditor(editor, `${sensitiveText}\n${name}`);

        await dispatchEnter(editor, init);

        await expect(page.locator(".amc-dialog")).toHaveCount(0, { timeout: 500 });
        await expect(output).toHaveAttribute("data-submitted", "false");
      } finally {
        await closeExtensionContext(target);
      }
    }
  });
});
