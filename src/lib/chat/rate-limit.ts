type RateLimitState = {
  lastMessageAtMsByGuestId: Map<string, number>;
};

export function createRateLimiter() {
  const state: RateLimitState = {
    lastMessageAtMsByGuestId: new Map(),
  };

  return {
    allowMessage(guestId: string, minIntervalMs: number) {
      const now = Date.now();
      const last = state.lastMessageAtMsByGuestId.get(guestId);
      if (typeof last === "number" && now - last < minIntervalMs) return false;
      state.lastMessageAtMsByGuestId.set(guestId, now);
      return true;
    },
  };
}

