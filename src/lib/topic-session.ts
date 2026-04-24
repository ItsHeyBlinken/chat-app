import { DEFAULT_TOPIC_SLUG, isValidTopicSlug } from "@/lib/topics";

const TOPIC_STORAGE_KEY = "topic_slug";

export function getTopicSlug() {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(TOPIC_STORAGE_KEY);
  if (!value) return null;
  return isValidTopicSlug(value) ? value : null;
}

export function setTopicSlug(slug: string) {
  if (typeof window === "undefined") return;
  if (!isValidTopicSlug(slug)) throw new Error("Invalid topic slug.");
  window.localStorage.setItem(TOPIC_STORAGE_KEY, slug);
}

export function clearTopicSlug() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOPIC_STORAGE_KEY);
}

export function getOrDefaultTopicSlug() {
  return getTopicSlug() ?? DEFAULT_TOPIC_SLUG;
}

