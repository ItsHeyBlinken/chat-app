const GUEST_SESSION_ID_STORAGE_KEY = "guest_session_id";
const GUEST_LABEL_STORAGE_KEY = "guest_label";

function randomInt(minInclusive: number, maxInclusive: number) {
  const min = Math.ceil(minInclusive);
  const max = Math.floor(maxInclusive);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateGuestId() {
  return `Guest${randomInt(1000, 9999)}`;
}

function generateSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback: not cryptographically strong, but sufficient for an MVP session ID.
  return `sess_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function getOrCreateGuestIdentity() {
  if (typeof window === "undefined") return null;

  const existingSessionId = window.sessionStorage.getItem(GUEST_SESSION_ID_STORAGE_KEY);
  const existingLabel = window.sessionStorage.getItem(GUEST_LABEL_STORAGE_KEY);

  if (existingSessionId && existingLabel) {
    return { sessionId: existingSessionId, label: existingLabel };
  }

  const sessionId = generateSessionId();
  const label = generateGuestId();
  window.sessionStorage.setItem(GUEST_SESSION_ID_STORAGE_KEY, sessionId);
  window.sessionStorage.setItem(GUEST_LABEL_STORAGE_KEY, label);
  return { sessionId, label };
}

export function clearGuestId() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(GUEST_SESSION_ID_STORAGE_KEY);
  window.sessionStorage.removeItem(GUEST_LABEL_STORAGE_KEY);
}

