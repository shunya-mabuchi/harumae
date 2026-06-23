import type { DetectorRule, Finding, RiskLevel } from "./types";

const riskMessage: Record<RiskLevel, string> = {
  critical: "外部へ送る前に必ず安全化したい情報です。",
  high: "外部へ送る前に強く確認したい情報です。",
  medium: "文脈によっては注意が必要な情報です。",
  low: "必要に応じて確認したい情報です。"
};

const placeholderByRuleId: Record<string, string> = {
  email: "EMAIL",
  phone: "PHONE",
  jwt: "JWT",
  aws_access_key: "AWS_KEY",
  github_token: "GITHUB_TOKEN",
  slack_token: "SLACK_TOKEN",
  stripe_secret_key: "STRIPE_KEY",
  openai_api_key: "OPENAI_API_KEY",
  npm_token: "NPM_TOKEN",
  oauth_client_secret: "OAUTH_CLIENT_SECRET",
  webhook_url: "WEBHOOK_URL",
  private_key: "PRIVATE_KEY",
  env_secret: "ENV_SECRET",
  basic_auth_url: "BASIC_AUTH_URL",
  database_url: "DATABASE_URL",
  credit_card: "CARD",
  my_number: "MY_NUMBER",
  url: "URL",
  ip_address: "IP_ADDRESS",
  amount: "AMOUNT",
  confidential_text: "CONFIDENTIAL_TEXT",
  internal_url: "INTERNAL_URL",
  date: "DATE",
  postal_code: "POSTAL_CODE",
  long_id: "ID"
};

export function createRuleFinding(
  input: string,
  rule: Pick<DetectorRule, "id" | "label" | "riskLevel">,
  start: number,
  end: number,
  confidence = 0.95
): Finding {
  const prefix = placeholderByRuleId[rule.id] ?? rule.id.toUpperCase();
  return {
    id: `rule:${rule.id}:${start}:${end}`,
    ruleId: rule.id,
    source: "rule",
    label: rule.label,
    riskLevel: rule.riskLevel,
    start,
    end,
    text: input.slice(start, end),
    placeholder: `[${prefix}_1]`,
    message: riskMessage[rule.riskLevel],
    confidence
  };
}

export function regexFindings(input: string, rule: DetectorRule, pattern: RegExp): Finding[] {
  const findings: Finding[] = [];
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input)) !== null) {
    const text = match[0];
    if (text.length === 0) {
      pattern.lastIndex += 1;
      continue;
    }

    const start = match.index;
    findings.push(createRuleFinding(input, rule, start, start + text.length));
  }

  return findings;
}

export function luhnCheck(value: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    const digit = Number(value[index]);
    if (!Number.isInteger(digit)) {
      return false;
    }

    let candidate = digit;
    if (shouldDouble) {
      candidate *= 2;
      if (candidate > 9) {
        candidate -= 9;
      }
    }

    sum += candidate;
    shouldDouble = !shouldDouble;
  }

  return sum > 0 && sum % 10 === 0;
}
