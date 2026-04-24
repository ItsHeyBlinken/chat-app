"use client";

import { TOPICS } from "@/lib/topics";

export function TopicPicker(props: { onPick: (slug: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Choose a topic</h1>
        <p className="text-sm text-white/70">Pick one room to join. You can switch later.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {TOPICS.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => props.onPick(t.slug)}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
          >
            <div className="text-sm font-semibold text-white">{t.name}</div>
            {t.description ? <div className="mt-1 text-xs text-white/60">{t.description}</div> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

