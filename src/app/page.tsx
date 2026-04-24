"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import { clearAgeConfirmed, isAgeConfirmed, setAgeConfirmed } from "@/lib/client-session";
import { clearGuestId, getOrCreateGuestId } from "@/lib/guest-id";

const AgeGate = dynamic(() => import("@/components/age-gate").then((m) => m.AgeGate), {
  ssr: false,
});

const ChatShell = dynamic(() => import("@/components/chat-shell").then((m) => m.ChatShell), {
  ssr: false,
});

export default function Home() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [ageOk, setAgeOk] = useState(false);

  useEffect(() => {
    // We intentionally initialize client-only state after mount to avoid SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuestId(getOrCreateGuestId());
    setAgeOk(isAgeConfirmed());
  }, []);

  if (!guestId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black px-6">
        <div className="text-sm text-white/70">Loading…</div>
      </div>
    );
  }

  if (!ageOk) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <AgeGate
            onConfirm={() => {
              setAgeConfirmed(true);
              setAgeOk(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <ChatShell
      guestId={guestId}
      onLogout={() => {
        clearAgeConfirmed();
        clearGuestId();
        setAgeOk(false);
        setGuestId(getOrCreateGuestId());
      }}
    />
  );
}
