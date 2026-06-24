import type { EditableTarget } from "../../lib/dom";
import { findFirstEditable, readEditableText, replaceEditableText } from "../dom/editorLocator";
import { isDefaultSendKeyboardEvent } from "../dom/sendInterceptor";

export type AdapterId = "chatgpt" | "claude" | "gemini" | "perplexity";

export interface SiteAdapter {
  id: AdapterId;
  findEditor(root: ParentNode): EditableTarget | null;
  findSendButton(root: ParentNode): HTMLElement | null;
  isSendKeyboardEvent(event: KeyboardEvent): boolean;
  readText(editor: EditableTarget): string;
  replaceText(editor: EditableTarget, text: string): void;
  submit(editor: EditableTarget): void;
}

interface BasicAdapterOptions {
  id: AdapterId;
  editorSelectors: string[];
  sendButtonSelectors: string[];
  sendButtonLabels: RegExp[];
}

function isActionableButton(element: Element | null): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (element.getAttribute("aria-disabled") === "true") {
    return false;
  }

  if (element instanceof HTMLButtonElement && element.disabled) {
    return false;
  }

  return true;
}

function buttonText(element: HTMLElement): string {
  return [
    element.textContent ?? "",
    element.getAttribute("aria-label") ?? "",
    element.getAttribute("title") ?? "",
    element.getAttribute("data-testid") ?? ""
  ].join(" ");
}

export function findSendButtonBySignals(root: ParentNode, selectors: string[], labels: RegExp[]): HTMLElement | null {
  for (const selector of selectors) {
    const button = root.querySelector(selector);
    if (isActionableButton(button)) {
      return button;
    }
  }

  const candidates = Array.from(root.querySelectorAll('button, [role="button"]'));
  return (
    candidates.find((candidate): candidate is HTMLElement => {
      if (!isActionableButton(candidate)) {
        return false;
      }

      const text = buttonText(candidate);
      return labels.some((label) => label.test(text));
    }) ?? null
  );
}

export function createBasicSiteAdapter(options: BasicAdapterOptions): SiteAdapter {
  return {
    id: options.id,
    findEditor(root) {
      return findFirstEditable(root, options.editorSelectors);
    },
    findSendButton(root) {
      return findSendButtonBySignals(root, options.sendButtonSelectors, options.sendButtonLabels);
    },
    isSendKeyboardEvent(event) {
      return isDefaultSendKeyboardEvent(event);
    },
    readText(editor) {
      return readEditableText(editor);
    },
    replaceText(editor, text) {
      replaceEditableText(editor, text);
    },
    submit(editor) {
      const button = this.findSendButton(document);
      if (button) {
        button.click();
        return;
      }

      editor.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          cancelable: true,
          ctrlKey: true,
          metaKey: navigator.platform.toLowerCase().includes("mac")
        })
      );
    }
  };
}
