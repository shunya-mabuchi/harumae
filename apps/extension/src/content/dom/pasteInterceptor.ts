import {
  createContentGuardContext,
  createPasteReviewPlan,
  type PasteReviewRequest
} from "../contentReview";
import { captureCurrentRange, findEditableTarget, insertTextAtTarget } from "../../lib/dom";

export type PasteReviewDecision =
  | {
      type: "insert";
      text: string;
    }
  | {
      type: "cancel";
    };

export interface PasteInterceptorOptions {
  isEnabled: () => boolean;
  getGuardContext: () => ReturnType<typeof createContentGuardContext>;
  review: (request: PasteReviewRequest) => Promise<PasteReviewDecision>;
  root?: Document;
}

export function installPasteInterceptor(options: PasteInterceptorOptions): () => void {
  const root = options.root ?? document;
  const pasteHandler = (event: ClipboardEvent) => {
    void handlePaste(event, options);
  };

  root.addEventListener("paste", pasteHandler, true);

  return () => {
    root.removeEventListener("paste", pasteHandler, true);
  };
}

export async function handlePaste(event: ClipboardEvent, options: PasteInterceptorOptions): Promise<void> {
  if (!options.isEnabled()) {
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

  const plan = createPasteReviewPlan(pastedText, options.getGuardContext());
  if (plan.type === "allow") {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  const savedRange = captureCurrentRange(target);
  const decision = await options.review(plan.request);

  if (decision.type === "insert") {
    insertTextAtTarget(target, decision.text, savedRange);
  }
}
