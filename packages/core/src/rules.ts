import { createRegexRule } from "./regexRuleFactory";
import {
  confidentialLineFindings,
  creditCardFindings,
  internalUrlFindings,
  myNumberFindings,
  phoneFindings
} from "./specializedDetectors";
import type { DetectorRule } from "./types";

const rules: DetectorRule[] = [
  createRegexRule({
    id: "email",
    label: "メールアドレス",
    riskLevel: "high",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
  }),
  {
    id: "phone",
    label: "日本の電話番号",
    riskLevel: "high",
    enabled: true,
    createFindings: (input) => phoneFindings(input, rulesById.phone!)
  },
  createRegexRule({
    id: "jwt",
    label: "JWT",
    riskLevel: "high",
    pattern: /\b[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g
  }),
  createRegexRule({
    id: "aws_access_key",
    label: "AWS Access Key風文字列",
    riskLevel: "high",
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g
  }),
  createRegexRule({
    id: "github_token",
    label: "GitHub token風文字列",
    riskLevel: "high",
    pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/g
  }),
  createRegexRule({
    id: "slack_token",
    label: "Slack token風文字列",
    riskLevel: "high",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g
  }),
  createRegexRule({
    id: "stripe_secret_key",
    label: "Stripe secret key風文字列",
    riskLevel: "high",
    pattern: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g
  }),
  createRegexRule({
    id: "openai_api_key",
    label: "OpenAI API key風文字列",
    riskLevel: "high",
    pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g
  }),
  createRegexRule({
    id: "npm_token",
    label: "npm token風文字列",
    riskLevel: "high",
    pattern: /\bnpm_[A-Za-z0-9]{16,}\b/g
  }),
  createRegexRule({
    id: "oauth_client_secret",
    label: "OAuth client secret風文字列",
    riskLevel: "high",
    pattern: /\b(?:client_secret|clientSecret)\s*[:=]\s*["']?[A-Za-z0-9._~/-]{16,}["']?/g
  }),
  createRegexRule({
    id: "webhook_url",
    label: "Webhook URL風文字列",
    riskLevel: "high",
    pattern: /\bhttps:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/_-]+|\bhttps:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+/g
  }),
  createRegexRule({
    id: "private_key",
    label: "秘密鍵",
    riskLevel: "high",
    pattern: /-----BEGIN (?:RSA |OPENSSH |EC |DSA |)?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |OPENSSH |EC |DSA |)?PRIVATE KEY-----/g
  }),
  createRegexRule({
    id: "env_secret",
    label: ".env形式の秘密情報",
    riskLevel: "high",
    pattern:
      /^[A-Z0-9_]*(?:SECRET|TOKEN|API_KEY|PASSWORD|PASS|ACCESS_KEY|PRIVATE_KEY|CLIENT_SECRET|DATABASE_URL)[A-Z0-9_]*\s*=\s*.+$/gim
  }),
  createRegexRule({
    id: "basic_auth_url",
    label: "Basic認証情報を含むURL",
    riskLevel: "high",
    pattern: /\bhttps?:\/\/[^\s:@/]+:[^\s@/]+@[^\s<>"'）)]+/gi
  }),
  createRegexRule({
    id: "database_url",
    label: "DATABASE_URL風接続文字列",
    riskLevel: "high",
    pattern: /\b(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|redis):\/\/[^\s:@/]+:[^\s@/]+@[^\s<>"'）)]+/gi
  }),
  {
    id: "credit_card",
    label: "クレジットカード風番号",
    riskLevel: "high",
    enabled: true,
    createFindings: (input) => creditCardFindings(input, rulesById.credit_card!)
  },
  {
    id: "my_number",
    label: "マイナンバー風文字列",
    riskLevel: "high",
    enabled: true,
    createFindings: (input) => myNumberFindings(input, rulesById.my_number!)
  },
  createRegexRule({
    id: "url",
    label: "URL",
    riskLevel: "medium",
    pattern: /\bhttps?:\/\/[^\s<>"'）)]+/gi
  }),
  createRegexRule({
    id: "ip_address",
    label: "IPv4アドレス",
    riskLevel: "medium",
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g
  }),
  createRegexRule({
    id: "amount",
    label: "金額",
    riskLevel: "medium",
    pattern:
      /(?:月額\s*)?(?:¥|￥)\s?\d{1,3}(?:,\d{3})*(?:\.\d+)?|(?:月額\s*)?\d{1,3}(?:,\d{3})*(?:万円|円)|(?:月額\s*)?\d+(?:\.\d+)?万円/g
  }),
  {
    id: "confidential_text",
    label: "社外秘・注意語を含む文",
    riskLevel: "medium",
    enabled: true,
    createFindings: (input) => confidentialLineFindings(input, rulesById.confidential_text!)
  },
  {
    id: "internal_url",
    label: "社内URLっぽいもの",
    riskLevel: "medium",
    enabled: true,
    createFindings: (input) => internalUrlFindings(input, rulesById.internal_url!)
  },
  createRegexRule({
    id: "date",
    label: "日付",
    riskLevel: "low",
    pattern: /\b\d{4}[/. -]\d{1,2}[/. -]\d{1,2}\b|(?:\d{4}年)?\d{1,2}月\d{1,2}日/g
  }),
  createRegexRule({
    id: "postal_code",
    label: "郵便番号",
    riskLevel: "low",
    pattern: /\b\d{3}-\d{4}\b/g
  }),
  createRegexRule({
    id: "long_id",
    label: "長いID風文字列",
    riskLevel: "low",
    pattern: /\b(?=[A-Za-z0-9]*[A-Za-z])(?=[A-Za-z0-9]*\d)[A-Za-z0-9]{16,}\b/g
  })
];

const rulesById = Object.fromEntries(rules.map((rule) => [rule.id, rule])) as Record<string, DetectorRule>;

export const detectorRules: DetectorRule[] = rules;
