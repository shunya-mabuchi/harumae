import { createBasicSiteAdapter } from "./baseAdapter";

export const chatgptAdapter = createBasicSiteAdapter({
  id: "chatgpt",
  editorSelectors: [
    "#prompt-textarea",
    'textarea[data-testid="prompt-textarea"]',
    '[contenteditable="true"][id="prompt-textarea"]',
    '[data-lexical-editor="true"]',
    '[contenteditable="true"]',
    "textarea"
  ],
  sendButtonSelectors: [
    'button[data-testid="send-button"]',
    'button[aria-label*="Send"]',
    'button[aria-label*="send"]',
    'button[aria-label*="送信"]',
    'form button[type="submit"]'
  ],
  sendButtonLabels: [/send/i, /送信/, /送る/]
});
