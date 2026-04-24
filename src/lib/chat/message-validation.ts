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
  return bannedWords.some((w) => lowered.includes(w.toLowerCase()));
}

