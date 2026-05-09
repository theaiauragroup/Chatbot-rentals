import * as React from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
  className?: string;
}

export function MessageBubble({ message, className }: MessageBubbleProps) {
  if (message.role === "system") {
    return (
      <div
        className={cn(
          "py-2 text-center text-[11px] text-fg-subtle italic",
          className
        )}
      >
        — {message.text} —
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {!isUser && (
        <span
          aria-hidden
          className="size-6 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0 mt-0.5"
        >
          <Bot className="size-3.5" aria-hidden />
        </span>
      )}
      <div className={cn("flex flex-col max-w-[70%]", isUser && "items-end")}>
        <span className="text-[10px] text-fg-subtle leading-none mb-1 tabular-nums">
          {isUser ? "Customer" : "Bot"} · {formatTime(message.sentAt)}
        </span>
        <div
          className={cn(
            "px-3 py-2 text-sm leading-snug",
            isUser
              ? "bg-accent-soft text-fg rounded-[8px] rounded-br-sm"
              : "bg-surface-2 text-fg rounded-[8px] rounded-bl-sm"
          )}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}
