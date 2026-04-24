"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import { clearAgeConfirmed, isAgeConfirmed, setAgeConfirmed } from "@/lib/client-session";
import { clearGuestId, getOrCreateGuestIdentity } from "@/lib/guest-id";
import { clearMatureLanguageConfirmed, isMatureLanguageConfirmed, setMatureLanguageConfirmed } from "@/lib/mature-consent";
import { clearTopicSlug, getTopicSlug, setTopicSlug } from "@/lib/topic-session";

const AgeGate = dynamic(() => import("@/components/age-gate").then((m) => m.AgeGate), {
  ssr: false,
});

const TopicPicker = dynamic(() => import("@/components/topic-picker").then((m) => m.TopicPicker), {
  ssr: false,
});

const MatureConsent = dynamic(() => import("@/components/mature-consent").then((m) => m.MatureConsent), {
  ssr: false,
});

const ChatShell = dynamic(() => import("@/components/chat-shell").then((m) => m.ChatShell), {
  ssr: false,
});

export default function Home() {
  const [guestIdentity, setGuestIdentity] = useState<{ sessionId: string; label: string } | null>(null);
  const [ageOk, setAgeOk] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [pendingMatureTopic, setPendingMatureTopic] = useState<string | null>(null);

  useEffect(() => {
    // We intentionally initialize client-only state after mount to avoid SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuestIdentity(getOrCreateGuestIdentity());
    setAgeOk(isAgeConfirmed());
    const storedTopic = getTopicSlug();
    if (storedTopic === "adult" && !isMatureLanguageConfirmed()) {
      clearTopicSlug();
      setPendingMatureTopic(storedTopic);
      setTopic(null);
    } else {
      setTopic(storedTopic);
    }
  }, []);

  if (!guestIdentity) {
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

  if (!topic) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          {pendingMatureTopic ? (
            <MatureConsent
              onBack={() => {
                setPendingMatureTopic(null);
              }}
              onConfirm={() => {
                setMatureLanguageConfirmed(true);
                setTopicSlug(pendingMatureTopic);
                setTopic(pendingMatureTopic);
                setPendingMatureTopic(null);
              }}
            />
          ) : (
          <TopicPicker
            onPick={(slug) => {
              if (slug === "adult" && !isMatureLanguageConfirmed()) {
                setPendingMatureTopic(slug);
                return;
              }
              setTopicSlug(slug);
              setTopic(slug);
            }}
          />
          )}
        </div>
      </div>
    );
  }

  return (
    <ChatShell
      guestId={guestIdentity.sessionId}
      guestLabel={guestIdentity.label}
      topic={topic}
      onChangeTopic={() => {
        clearTopicSlug();
        setTopic(null);
      }}
      onLogout={() => {
        clearAgeConfirmed();
        clearGuestId();
        clearTopicSlug();
        clearMatureLanguageConfirmed();
        setAgeOk(false);
        setTopic(null);
        setPendingMatureTopic(null);
        setGuestIdentity(getOrCreateGuestIdentity());
      }}
    />
  );
}
