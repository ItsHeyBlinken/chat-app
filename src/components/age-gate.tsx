"use client";

import { useState } from "react";

export function AgeGate(props: { onConfirm: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">18+ required</h1>
        <p className="text-sm text-white/70">
          You must confirm you are 18+ to enter. This is self-attestation only.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-white/20 bg-black/30"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span>I confirm that I am 18 years of age or older.</span>
      </label>

      <button
        type="button"
        disabled={!checked}
        onClick={props.onConfirm}
        className="h-11 rounded-lg bg-white px-4 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        Enter chat
      </button>
    </div>
  );
}

