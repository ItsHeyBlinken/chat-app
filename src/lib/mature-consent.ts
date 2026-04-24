const MATURE_LANGUAGE_CONFIRMED_STORAGE_KEY = "mature_language_confirmed";

export function isMatureLanguageConfirmed() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(MATURE_LANGUAGE_CONFIRMED_STORAGE_KEY) === "true";
}

export function setMatureLanguageConfirmed(value: boolean) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(MATURE_LANGUAGE_CONFIRMED_STORAGE_KEY, value ? "true" : "false");
}

export function clearMatureLanguageConfirmed() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(MATURE_LANGUAGE_CONFIRMED_STORAGE_KEY);
}

