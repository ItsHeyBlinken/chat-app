"use client";

import { useState } from "react";

export function MatureConsent(props: { onConfirm: () => void; onBack: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Mature language warning</h1>
        <p className="text-sm text-white/70">
          This topic may contain explicit language, sexual content, and racial slurs. Links and social handles are still blocked.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-white"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span className="text-sm text-white/80">
          I understand this topic may include explicit content (including racial slurs) and want to enter.
        </span>
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          className="h-11 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/80 hover:bg-white/10"
          onClick={props.onBack}
        >
          Back
        </button>
        <button
          type="button"
          disabled={!checked}
          className={[
            "h-11 flex-1 rounded-2xl px-4 text-sm font-semibold",
            checked ? "bg-white text-black hover:bg-white/90" : "bg-white/20 text-white/50",
          ].join(" ")}
          onClick={props.onConfirm}
        >
          Enter adult topic
        </button>
      </div>
    </div>
  );
}

