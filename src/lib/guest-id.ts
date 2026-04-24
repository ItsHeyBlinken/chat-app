const GUEST_ID_STORAGE_KEY = "guest_id";

function randomInt(minInclusive: number, maxInclusive: number) {
  const min = Math.ceil(minInclusive);
  const max = Math.floor(maxInclusive);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateGuestId() {
  return `Guest${randomInt(1000, 9999)}`;
}

export function getOrCreateGuestId() {
  if (typeof window === "undefined") return null;

  const existing = window.localStorage.getItem(GUEST_ID_STORAGE_KEY);
  if (existing) return existing;

  const next = generateGuestId();
  window.localStorage.setItem(GUEST_ID_STORAGE_KEY, next);
  return next;
}

export function clearGuestId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_ID_STORAGE_KEY);
}

