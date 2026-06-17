import { Clipboard, RefreshCcw, ShieldCheck, Sparkles, Wand2, type LucideIcon } from "lucide-react";
import type { DetectionResult, DetectionSummary, Finding } from "@ai-mae-check/core";
import type { ContextRiskCandidate, LlmErrorDetail } from "@ai-mae-check/llm";
import type { LlmStatus } from "../lib/demoConstants";
import {
  createDemoWorkbenchActions,
  type DemoWorkbenchActionIcon,
  type DemoWorkbenchActionId
} from "../lib/demoWorkbenchActions";
import { Button, Surface } from "./ui";
import { DetectionResults } from "./DetectionResults";
import { MaskResult } from "./MaskResult";

const workflowSteps = [
  { label: "1", title: "下書きを入れる", text: "サンプルでも自由入力でもOK" },
  { label: "2", title: "検出結果を確認", text: "チェックを外すと出力も変わる" },
  { label: "3", title: "マスクして使う", text: "送る前の文章だけをコピー" }
];

const actionIcons: Record<DemoWorkbenchActionIcon, LucideIcon> = {
  clipboard: Clipboard,
  sparkles: Sparkles,
  shield_check: ShieldCheck,
  wand: Wand2,
  refresh: RefreshCcw
};

export function DemoCard({
  text,
  onTextChange,
  onInsertSample,
  onInsertContextSample,
  onRuleDetection,
  onLlmDetection,
  onCopyMaskedText,
  onReset,
  detection,
  summary,
  selectedRuleFindingIds,
  onToggleRuleFinding,
  llmCandidates,
  selectedCandidateIds,
  onToggleCandidate,
  llmStatus,
  llmMessage,
  llmErrorDetail,
  maskedText,
  copyMessage
}: {
  text: string;
  onTextChange: (value: string) => void;
  onInsertSample: () => void;
  onInsertContextSample: () => void;
  onRuleDetection: () => void;
  onLlmDetection: () => void;
  onCopyMaskedText: () => void;
  onReset: () => void;
  detection: DetectionResult | null;
  summary: DetectionSummary;
  selectedRuleFindingIds: string[];
  onToggleRuleFinding: (id: string) => void;
  llmCandidates: ContextRiskCandidate[];
  selectedCandidateIds: string[];
  onToggleCandidate: (id: string) => void;
  llmStatus: LlmStatus;
  llmMessage: string;
  llmErrorDetail: LlmErrorDetail | null;
  maskedText: string;
  copyMessage: string;
}) {
  const findings: Finding[] = detection?.findings ?? [];
  const actionHandlers: Record<DemoWorkbenchActionId, () => void> = {
    sample_rules: onInsertSample,
    sample_context: onInsertContextSample,
    detect_rules: onRuleDetection,
    check_context: onLlmDetection,
    copy_masked: onCopyMaskedText,
    reset: onReset
  };
  const actions = createDemoWorkbenchActions({
    llmStatus,
    hasMaskedText: maskedText.length > 0
  });

  return (
    <section id="demo" className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:items-end">
          <div>
            <p className="mb-3 text-sm font-black text-leaf">ライブデモ</p>
            <h2 className="text-3xl font-black leading-tight text-ink md:text-5xl">安全化ワークベンチ</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted md:text-lg">
              文章を入れる、検出する、マスク結果を確認する。AIに送る前のひと手間を、実際の操作として体験できます。
            </p>
          </div>
          <div className="grid gap-2 rounded-card border border-line bg-white/75 p-3 shadow-soft">
            <p className="text-xs font-black text-leaf">3ステップで確認</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {workflowSteps.map((step) => (
                <div key={step.title} className="rounded-[6px] bg-cloud p-3">
                  <p className="text-xs font-black text-leaf">{step.label}</p>
                  <p className="mt-1 text-sm font-black text-ink">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Surface className="overflow-hidden border-ink/10">
          <div className="border-b border-line bg-ink px-4 py-4 text-white md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-black text-white/60">AIまえチェック デモ</p>
                <h3 className="mt-1 text-xl font-black tracking-normal">入力からマスク結果まで、同じ画面で確認</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap xl:justify-end">
                {actions.map((action) => {
                  const Icon = actionIcons[action.icon];
                  return (
                    <Button
                      key={action.id}
                      onClick={actionHandlers[action.id]}
                      variant={action.variant}
                      disabled={action.disabled}
                      className={action.className}
                    >
                      <Icon size={17} aria-hidden="true" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)_minmax(0,1fr)]">
            <div className="border-b border-line bg-white p-4 md:p-6 xl:border-b-0 xl:border-r">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-muted">送信前の下書き</p>
                  <h3 className="text-xl font-black text-ink">入力テキスト</h3>
                </div>
                <span className="rounded-card bg-cloud px-3 py-2 text-xs font-black text-muted">{text.length.toLocaleString()}文字</span>
              </div>
              <div className="rounded-card border border-line bg-[#fbfdf9] p-3 shadow-inner">
                <textarea
                  value={text}
                  onChange={(event) => onTextChange(event.target.value)}
                  className="min-h-[320px] w-full resize-y bg-transparent p-2 text-sm leading-7 text-ink outline-none placeholder:text-slate-400 md:min-h-[480px]"
                  placeholder="ここにAIへ送る前の文章を入力してください。"
                />
              </div>
            </div>

            <div className="border-b border-line bg-[#f8faf7] p-4 md:p-6 xl:border-b-0 xl:border-r">
              <DetectionResults
                findings={findings}
                selectedFindingIds={selectedRuleFindingIds}
                onToggleFinding={onToggleRuleFinding}
                summary={summary}
                llmStatus={llmStatus}
                llmMessage={llmMessage}
                llmErrorDetail={llmErrorDetail}
                llmCandidates={llmCandidates}
                selectedCandidateIds={selectedCandidateIds}
                onToggleCandidate={onToggleCandidate}
              />
            </div>

            <div className="bg-white p-4 md:p-6">
              <MaskResult maskedText={maskedText} copyMessage={copyMessage} onCopy={onCopyMaskedText} />
            </div>
          </div>
        </Surface>
      </div>
    </section>
  );
}
