import { createBasicSiteAdapter } from "./baseAdapter";

export const perplexityAdapter = createBasicSiteAdapter({
  id: "perplexity",
  editorSelectors: [
    'textarea[placeholder*="Ask"]',
    'textarea[aria-label*="Ask"]',
    '[contenteditable="true"][aria-label*="Ask"]',
    '[contenteditable="true"][role="textbox"]',
    '[role="textbox"]',
    '[contenteditable="true"]',
    "textarea"
  ],
  sendButtonSelectors: [
    'button[aria-label*="Submit"]',
    'button[aria-label*="submit"]',
    'button[aria-label*="Send"]',
    'button[aria-label*="send"]',
    'button[aria-label*="Ask"]',
    'button[aria-label*="送信"]',
    'button[data-testid*="submit"]',
    'button[data-testid*="send"]',
    'form button[type="submit"]'
  ],
  sendButtonLabels: [/submit/i, /send/i, /ask/i, /送信/, /送る/]
});
