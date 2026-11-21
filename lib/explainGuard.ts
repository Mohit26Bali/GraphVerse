/** Largest request body the explain route will read. */
export const MAX_BODY_BYTES = 4 * 1024;

const LIMITS = { moduleTitle: 80, context: 1500 } as const;

// Control characters are never needed in these fields and are a common way to smuggle
// instructions into a prompt. Line breaks are turned into spaces.
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F]/g;

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(CONTROL, "").replace(/[\r\n]+/g, " ").trim();
  if (text.length === 0 || text.length > max) return null;
  return text;
}

export type GuardResult =
  | { ok: true; moduleTitle: string; context: string }
  | { ok: false; message: string };

/**
 * Validates what the browser sends. The module must be a real GraphVerse module and the
 * description of the current state must be short text, so the route cannot be used as a
 * free general-purpose model.
 */
export function validateExplainRequest(input: unknown, knownModuleTitles: readonly string[]): GuardResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, message: "Invalid request." };
  }
  const raw = input as Record<string, unknown>;
  const moduleTitle = clean(raw.moduleTitle, LIMITS.moduleTitle);
  if (!moduleTitle || !knownModuleTitles.includes(moduleTitle)) return { ok: false, message: "Unknown module." };
  const context = clean(raw.context, LIMITS.context);
  if (!context) return { ok: false, message: "Missing or too long a description of the current state." };
  return { ok: true, moduleTitle, context };
}

/** Never send more than this to the browser, whatever the model returns. */
export function tidyExplanation(text: string, maxChars = 900): string {
  const trimmed = text.replace(CONTROL, "").trim();
  return trimmed.length > maxChars ? trimmed.slice(0, maxChars).trimEnd() + "…" : trimmed;
}

/** Same-origin check for a browser POST: the Origin header, when present, must match the site. */
export function isSameOrigin(origin: string | null, host: string | null, allowedOrigin?: string): boolean {
  if (!origin) return true; // not a browser cross-site request (curl, tests); the rate limit still applies
  if (allowedOrigin && origin === allowedOrigin) return true;
  try {
    return host !== null && new URL(origin).host === host;
  } catch {
    return false;
  }
}
