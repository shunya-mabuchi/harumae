import { createBasicSiteAdapter } from "./baseAdapter";

export const claudeAdapter = createBasicSiteAdapter({
  id: "claude",
  editorSelectors: [
    '[data-testid="chat-input"] [contenteditable="true"]',
    '[aria-label*="Write"]',
    '[aria-label*="Message"]',
    ".ProseMirror",
    '[contenteditable="true"]',
    "textarea"
  ],
  sendButtonSelectors: [
    'button[aria-label*="Send"]',
    'button[aria-label*="send"]',
    'button[aria-label*="送信"]',
    'button[data-testid*="send"]',
    'form button[type="submit"]'
  ],
  sendButtonLabels: [/send/i, /送信/, /送る/]
});
