import { createRegexRule } from "../regexRuleFactory";
import type { DetectorRule } from "../types";

export const secretDetectorRules: DetectorRule[] = [
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
  })
];
