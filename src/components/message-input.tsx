"use client";

import { useState } from "react";

export function MessageInput(props: {
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (props.disabled) return;

        const next = text;
        setText("");
        props.onSend(next);
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (props.disabled) return;
          if (e.key !== "Enter") return;
          if (e.shiftKey) return;

          e.preventDefault();

          const next = text;
          setText("");
          props.onSend(next);
        }}
        placeholder={props.disabled ? "Connecting..." : "Type a message"}
        rows={1}
        disabled={props.disabled}
        className="min-h-11 max-h-32 flex-1 resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={props.disabled || text.trim().length === 0}
        className="h-11 rounded-xl bg-white px-4 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}

