function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)));
}

function findFencedJsonBlocks(rawText: string): string[] {
  const blocks: string[] = [];
  const pattern = /```(?:json|JSON)?\s*([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(rawText)) !== null) {
    if (match[1]) {
      blocks.push(match[1]);
    }
  }

  return blocks;
}

function findBalancedObjects(rawText: string): string[] {
  const objects: string[] = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < rawText.length; index += 1) {
    const char = rawText[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        start = index;
      }
      depth += 1;
      continue;
    }

    if (char === "}" && depth > 0) {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        objects.push(rawText.slice(start, index + 1));
        start = -1;
      }
    }
  }

  return objects;
}

function hasPreferredKey(parsed: unknown, preferredKeys: string[]): boolean {
  if (preferredKeys.length === 0) {
    return true;
  }

  if (Array.isArray(parsed)) {
    return true;
  }

  return isRecord(parsed) && preferredKeys.some((key) => Object.prototype.hasOwnProperty.call(parsed, key));
}

export function extractJsonObject(rawText: string, preferredKeys: string[] = []): string {
  const candidates = unique([rawText, ...findFencedJsonBlocks(rawText), ...findBalancedObjects(rawText)]);
  let firstJsonValue = "";

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (!isRecord(parsed) && !Array.isArray(parsed)) {
        continue;
      }

      if (firstJsonValue.length === 0) {
        firstJsonValue = candidate;
      }

      if (hasPreferredKey(parsed, preferredKeys)) {
        return candidate;
      }
    } catch {
      // LLM出力に混ざった説明文や壊れた候補は無視し、次の候補を試す。
    }
  }

  return firstJsonValue.length > 0 ? firstJsonValue : rawText;
}
