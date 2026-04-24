const AGE_CONFIRMED_STORAGE_KEY = "age_confirmed";

export function isAgeConfirmed() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AGE_CONFIRMED_STORAGE_KEY) === "true";
}

export function setAgeConfirmed(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AGE_CONFIRMED_STORAGE_KEY, value ? "true" : "false");
}

export function clearAgeConfirmed() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AGE_CONFIRMED_STORAGE_KEY);
}

