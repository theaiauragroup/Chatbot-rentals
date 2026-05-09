import * as React from "react";
import { MessageBubble } from "./MessageBubble";
import type { Chat } from "@/lib/types";

interface TranscriptViewProps {
  chat: Chat;
  className?: string;
}

export function TranscriptView({ chat, className }: TranscriptViewProps) {
  return (
    <ol className={"flex flex-col gap-4 " + (className ?? "")}>
      {chat.messages.map((m) => (
        <li key={m.id}>
          <MessageBubble message={m} />
        </li>
      ))}
    </ol>
  );
}
