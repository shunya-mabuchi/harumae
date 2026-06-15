import { createBasicSiteAdapter } from "./baseAdapter";

export const geminiAdapter = createBasicSiteAdapter({
  id: "gemini",
  editorSelectors: [
    "rich-textarea textarea",
    'div[contenteditable="true"]',
    '[role="textbox"]',
    ".ql-editor",
    "textarea"
  ],
  sendButtonSelectors: [
    'button[aria-label*="Send"]',
    'button[aria-label*="send"]',
    'button[aria-label*="送信"]',
    'button[aria-label*="送る"]',
    'button[data-testid*="send"]'
  ],
  sendButtonLabels: [/send/i, /送信/, /送る/]
});
