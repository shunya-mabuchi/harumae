import { defineContentScript } from "wxt/utils/define-content-script";
import { detectSensitiveText, evaluateDlpPolicy, type DetectionResult } from "@ai-mae-check/core";
import { adapterForHostname } from "../src/content/adapters";
import { installSendInterceptor } from "../src/content/dom/sendInterceptor";
import { captureCurrentRange, findEditableTarget, insertTextAtTarget } from "../src/lib/dom";
import { DEFAULT_SETTINGS, disabledRuleIds, isSiteEnabled, loadSettings, normalizeSettings, SETTINGS_KEY, type AiMaeCheckSettings } from "../src/lib/settings";
import { targetMatches } from "../src/lib/sites";
import { showPasteReviewModal } from "../src/lib/modal";

export default defineContentScript({
  matches: targetMatches,
  runAt: "document_start",
  main() {
    let settings: AiMaeCheckSettings = DEFAULT_SETTINGS;

    void loadSettings().then((loadedSettings) => {
      settings = loadedSettings;
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local" || !changes[SETTINGS_KEY]) {
        return;
      }

      settings = normalizeSettings(changes[SETTINGS_KEY].newValue);
    });

    document.addEventListener(
      "paste",
      (event) => {
        void handlePaste(event, settings);
      },
      true
    );

    const adapter = adapterForHostname(window.location.hostname);
    if (adapter) {
      installSendInterceptor({
        adapter,
        isEnabled: () => settings.enabled && isSiteEnabled(settings, window.location.hostname),
        prepareReview: (inputText) => {
          const detection = createDetection(inputText, settings);
          const policy = evaluateDlpPolicy(detection.findings);

          if (detection.findings.length === 0 || policy.action === "allow") {
            return null;
          }

          return {
            inputText,
            detection
          };
        },
        review: async ({ inputText, detection }) => {
          const decision = await showPasteReviewModal({
            inputText,
            detection,
            settings
          });

          if (decision.type === "insert") {
            return {
              type: "replaceAndSubmit",
              text: decision.text
            };
          }

          return { type: "cancel" };
        }
      });
    }
  }
});

function createDetection(inputText: string, settings: AiMaeCheckSettings): DetectionResult {
  return detectSensitiveText(inputText, {
    disabledRuleIds: disabledRuleIds(settings)
  });
}

async function handlePaste(event: ClipboardEvent, settings: AiMaeCheckSettings): Promise<void> {
  if (!settings.enabled || !isSiteEnabled(settings, window.location.hostname)) {
    return;
  }

  const target = findEditableTarget(event.target);
  if (!target) {
    return;
  }

  const pastedText = event.clipboardData?.getData("text/plain") ?? "";
  if (pastedText.length === 0) {
    return;
  }

  const detection = createDetection(pastedText, settings);

  if (detection.findings.length === 0) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  const savedRange = captureCurrentRange(target);
  const decision = await showPasteReviewModal({
    inputText: pastedText,
    detection,
    settings
  });

  if (decision.type === "insert") {
    insertTextAtTarget(target, decision.text, savedRange);
  }
}
