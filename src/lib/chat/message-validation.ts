const MAX_MESSAGE_LENGTH = 500;

export type MessageValidationResult =
  | { ok: true; text: string }
  | { ok: false; reason: string };

export function validateMessageText(input: string): MessageValidationResult {
  const text = input.trim();

  if (text.length === 0) return { ok: false, reason: "Message cannot be empty." };
  if (text.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, reason: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).` };
  }

  return { ok: true, text };
}

export function containsBannedWord(text: string, bannedWords: string[]) {
  const lowered = text.toLowerCase();

  // Match whole words only to reduce false positives (e.g. "jiggle").
  // We also normalize common "word separators" so punctuation doesn't bypass matching.
  const normalized = lowered.replace(/[^a-z0-9]+/g, " ");

  const escaped = bannedWords
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (escaped.length === 0) return false;

  const re = new RegExp(`\\b(?:${escaped.join("|")})\\b`, "i");
  return re.test(normalized);
}

function normalizeForLinkScan(input: string) {
  // Normalize common obfuscations like "dot", "(dot)", "[dot]" and remove obvious separators.
  return input
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\(dot\)|\[dot\]|\{dot\}|dot/g, ".")
    .replace(/，|。|．|｡/g, "."); // common unicode dots
}

export function containsLinkLikeText(text: string) {
  const raw = text.toLowerCase();
  const normalized = normalizeForLinkScan(text);

  // Fast-path checks (avoid expensive regex work for normal chat).
  if (
    raw.includes("http://") ||
    raw.includes("https://") ||
    raw.includes("www.") ||
    normalized.includes("www.") ||
    raw.includes(".com") ||
    raw.includes(".net") ||
    raw.includes(".org")
  ) {
    return true;
  }

  // Domain-ish pattern: something.(tld) with optional obfuscation already normalized.
  // This is intentionally conservative: if it looks like a domain, we block it.
  const domainLike = /\b[a-z0-9-]{2,}\.[a-z]{2,24}\b/i;
  if (domainLike.test(normalized)) return true;

  return false;
}

function normalizeForHandleScan(input: string) {
  return input
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[_\-]+/g, "_")
    .trim();
}

export function containsHandleShareText(text: string, extraKeywords: string[] = []) {
  const raw = text.toLowerCase();
  const normalized = normalizeForHandleScan(text);

  // Common "reach me" language
  const reachMe = /\b(dm me|message me|add me|hit me up|contact me|snap me|text me)\b/i;
  if (reachMe.test(normalized)) return true;

  // Obvious "@" handle. Allow our own guest IDs (Guest1234) without @, but block @something.
  const atHandle = /(^|\s)@[a-z0-9_\.]{2,32}\b/i;
  if (atHandle.test(normalized)) return true;

  // Platform keywords + likely identifier nearby.
  const baseKeywords = [
    "discord",
    "instagram",
    "insta",
    "ig",
    "snap",
    "snapchat",
    "telegram",
    "kik",
    "whatsapp",
    "signal",
    "wechat",
    "tiktok",
    "twitter",
    "facebook",
    "fb",
    "reddit",
    "onlyfans",
  ];

  const keywords = [...new Set([...baseKeywords, ...extraKeywords.map((k) => k.toLowerCase())])];
  const keywordText = raw.replace(/[^a-z0-9]+/g, " ");
  const mentionsKeyword = keywords.some((k) => {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(keywordText);
  });

  if (mentionsKeyword) {
    // If they mention a platform and include something that looks like a handle / tag / id.
    const looksLikeId = /\b[a-z0-9][a-z0-9_\.]{2,32}\b/i;
    if (looksLikeId.test(normalized)) return true;
  }

  // Catch "dot" obfuscations for socials: "insta dot name"
  if (raw.includes(" dot ") || raw.includes("(dot)") || raw.includes("[dot]")) return true;

  return false;
}

