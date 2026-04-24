export type Topic = {
  slug: string;
  name: string;
  description?: string;
};

export const TOPICS: Topic[] = [
  { slug: "tech", name: "Tech", description: "Software, gadgets, AI, and more" },
  { slug: "fitness", name: "Fitness", description: "Training, nutrition, consistency" },
  { slug: "dating", name: "Dating", description: "Advice, stories, and boundaries" },
  { slug: "money", name: "Money", description: "Budgeting, jobs, business, goals" },
  { slug: "random", name: "Random", description: "Anything goes (keep it respectful)" },
];

export const DEFAULT_TOPIC_SLUG = TOPICS[0]?.slug ?? "tech";

export function isValidTopicSlug(slug: string) {
  return TOPICS.some((t) => t.slug === slug);
}

