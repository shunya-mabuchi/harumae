import type { EditableTarget } from "../../lib/dom";

const blockedInputTypes = new Set(["password", "email", "tel", "number"]);

const defaultEditorSelectors = [
  "textarea:not([disabled]):not([readonly])",
  'input[type="text"]:not([disabled]):not([readonly])',
  'input[type="search"]:not([disabled]):not([readonly])',
  '[contenteditable="true"]',
  '[contenteditable="plaintext-only"]',
  '[data-lexical-editor="true"]',
  ".ProseMirror",
  '[role="textbox"]'
];

function looksLikeCreditCardField(input: HTMLInputElement): boolean {
  const joined = [input.name, input.id, input.autocomplete, input.placeholder].join(" ").toLowerCase();
  return /\bcc-|credit|card|cvc|cvv|security-code|expir/.test(joined);
}

function isSupportedInput(element: Element): element is HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) {
    return false;
  }

  const type = element.type || "text";
  return (type === "text" || type === "search") && !blockedInputTypes.has(type) && !looksLikeCreditCardField(element);
}

function isUsableControl(element: HTMLInputElement | HTMLTextAreaElement): boolean {
  return !element.disabled && !element.readOnly;
}

function isEditableHost(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (element.getAttribute("aria-disabled") === "true") {
    return false;
  }

  return (
    element.isContentEditable ||
    element.getAttribute("contenteditable") === "true" ||
    element.getAttribute("contenteditable") === "plaintext-only" ||
    element.getAttribute("data-lexical-editor") === "true" ||
    element.classList.contains("ProseMirror") ||
    element.getAttribute("role") === "textbox"
  );
}

function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
}

export function isEditableCandidate(element: Element | null): element is EditableTarget {
  if (!element) {
    return false;
  }

  if (element instanceof HTMLTextAreaElement) {
    return isUsableControl(element);
  }

  if (isSupportedInput(element)) {
    return isUsableControl(element);
  }

  return isEditableHost(element);
}

export function findFirstEditable(root: ParentNode, selectors: string[] = defaultEditorSelectors): EditableTarget | null {
  if (root instanceof Element && isEditableCandidate(root)) {
    return root;
  }

  for (const selector of selectors) {
    const candidates = Array.from(root.querySelectorAll(selector));
    for (const candidate of candidates) {
      if (!isEditableCandidate(candidate)) {
        continue;
      }

      if (candidate instanceof HTMLElement && !isVisible(candidate)) {
        continue;
      }

      return candidate;
    }
  }

  return null;
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

  if (descriptor?.set) {
    descriptor.set.call(element, value);
    return;
  }

  element.value = value;
}

function dispatchReplacementInput(element: Element, text: string): void {
  element.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      cancelable: false,
      inputType: "insertReplacementText",
      data: text
    })
  );
}

export function readEditableText(editor: EditableTarget): string {
  if (editor instanceof HTMLInputElement || editor instanceof HTMLTextAreaElement) {
    return editor.value;
  }

  return editor.textContent ?? "";
}

export function replaceEditableText(editor: EditableTarget, text: string): void {
  editor.focus();

  if (editor instanceof HTMLInputElement || editor instanceof HTMLTextAreaElement) {
    setNativeValue(editor, text);
    editor.setSelectionRange(text.length, text.length);
    dispatchReplacementInput(editor, text);
    return;
  }

  editor.replaceChildren(document.createTextNode(text));
  dispatchReplacementInput(editor, text);
}
