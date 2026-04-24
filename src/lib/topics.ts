export type Topic = {
  slug: string;
  name: string;
  description?: string;
  bannedWordsEnabled: boolean;
};

export const TOPICS: Topic[] = [
  { slug: "tech", name: "Tech", description: "Software, gadgets, AI, and more", bannedWordsEnabled: true },
  { slug: "gaming", name: "Gaming", description: "Games, consoles, PC builds, and strategy", bannedWordsEnabled: true },
  { slug: "fitness", name: "Fitness", description: "Training, nutrition, consistency", bannedWordsEnabled: true },
  { slug: "dating", name: "Dating", description: "Advice, stories, and boundaries", bannedWordsEnabled: true },
  { slug: "money", name: "Money", description: "Budgeting, jobs, business, goals", bannedWordsEnabled: true },
  { slug: "adult", name: "Adult (18+)", description: "No profanity filter (links/handles still blocked)", bannedWordsEnabled: false },
  { slug: "random", name: "Random", description: "Anything goes (keep it respectful)", bannedWordsEnabled: true },
];

export const DEFAULT_TOPIC_SLUG = TOPICS[0]?.slug ?? "tech";

export function isValidTopicSlug(slug: string) {
  return TOPICS.some((t) => t.slug === slug);
}

export function getTopicBySlug(slug: string) {
  return TOPICS.find((t) => t.slug === slug) ?? null;
}

