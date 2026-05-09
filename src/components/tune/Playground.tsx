"use client";

import * as React from "react";
import { Bot, RotateCcw, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTuneStore } from "./TuneStore";
import { tenant } from "@/lib/mock";
import type { PromptSettings } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

interface PlaygroundMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  at: string;
}

const TONE_RECASES: Array<(s: string) => string> = [
  // 0–2: strict
  (s) => s.replace(/!+/g, ".").replace(/\bhey\b/gi, "Hello"),
  (s) => s.replace(/!+/g, ".").replace(/\bhey\b/gi, "Hello"),
  (s) => s.replace(/!+/g, ".").replace(/\bhey\b/gi, "Hello"),
  // 3–4: friendly-pro (passthrough)
  (s) => s,
  (s) => s,
  // 5–6: warm
  (s) => s.replace(/^I/, "I'd").replace(/\.$/, ". 😊").replace(/😊/, ""),
  (s) => s,
  // 7–8: playful
  (s) => s.replace(/Got it\./, "Awesome — got it!"),
  (s) => s.replace(/Got it\./, "Got it 👍").replace(/👍/, ""),
  // 9–10: casual text
  (s) => s.toLowerCase().replace(/\.$/, "").replace(/i'd/gi, "i'd"),
  (s) => s.toLowerCase().replace(/\.$/, ""),
];

function greetingFor(s: PromptSettings, business: string): string {
  if (s.greetingStyle === "warm")
    return "Hey! Looking to rent a car? I can help with dates, prices, and availability.";
  if (s.greetingStyle === "concise") return "Hi. What dates and what kind of car?";
  return `Hi, welcome to ${business}. How can I help?`;
}

function mockBotReply(text: string, s: PromptSettings, business: string): string {
  const t = text.toLowerCase().trim();
  let base: string;
  if (!t) {
    base = greetingFor(s, business);
  } else if (/(suv|rav4|cr-?v|outback|cherokee|sorento)/.test(t)) {
    base = `Got it. Toyota RAV4 starts at $89/day; Honda CR-V at $85/day. What pickup dates?`;
  } else if (/(luxury|bmw|mercedes|audi|tesla)/.test(t)) {
    base = `Got it. BMW 5 Series 2024 is $179/day, Mercedes E-Class at $199/day. Pickup dates?`;
  } else if (/(econ|cheap|budget|civic|corolla|sentra)/.test(t)) {
    base = `Got it. Toyota Corolla starts at $45/day, Honda Civic at $49/day. Pickup dates?`;
  } else if (/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|may|jun|jul|aug|sep|oct|\d{1,2}\/\d{1,2})\b/.test(t)) {
    base = `Got it. Let me check availability for those dates and come back with a quote.`;
  } else if (/\b(book|reserve|hold|let.?s do it|sounds good|yes please)\b/.test(t)) {
    base = `Perfect. Could I get your name and phone for the booking?`;
  } else if (/(price|cost|how much|quote)/.test(t)) {
    base = `Daily rates start at $45. Tell me your dates and I’ll quote the total — including a ${s.businessRules.multiDayDiscountPct}% multi-day discount on rentals ≥ ${s.businessRules.minRentalDays + 6} days.`;
  } else if (/(person|human|talk|manager)/.test(t)) {
    base = `Sure — I’ll have ${business}'s manager text you within the hour.`;
  } else {
    base = `Got it. What dates and what kind of car?`;
  }
  const recase = TONE_RECASES[Math.min(10, Math.max(0, s.toneIndex))];
  return recase(base);
}

const NOW = "2026-05-08T14:32:00-07:00";

interface PaneState {
  messages: PlaygroundMessage[];
}

export function Playground() {
  const store = useTuneStore();

  const [livePane, setLivePane] = React.useState<PaneState>(() => ({
    messages: greetMessages(store.current.settings, tenant.businessName, "live"),
  }));
  const [draftPane, setDraftPane] = React.useState<PaneState>(() => ({
    messages: greetMessages(store.draft, tenant.businessName, "draft"),
  }));
  const [mirror, setMirror] = React.useState(true);

  function send(side: "live" | "draft", text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (mirror) {
      pushUserAndReply("live", trimmed);
      pushUserAndReply("draft", trimmed);
    } else {
      pushUserAndReply(side, trimmed);
    }
  }

  function pushUserAndReply(side: "live" | "draft", text: string) {
    const settings =
      side === "live" ? store.current.settings : store.draft;
    const userMsg: PlaygroundMessage = {
      id: `m-${side}-${Date.now()}-u`,
      role: "user",
      text,
      at: NOW,
    };
    const botMsg: PlaygroundMessage = {
      id: `m-${side}-${Date.now()}-b`,
      role: "bot",
      text: mockBotReply(text, settings, tenant.businessName),
      at: NOW,
    };
    if (side === "live")
      setLivePane((p) => ({ messages: [...p.messages, userMsg, botMsg] }));
    else setDraftPane((p) => ({ messages: [...p.messages, userMsg, botMsg] }));
  }

  function reset() {
    setLivePane({
      messages: greetMessages(store.current.settings, tenant.businessName, "live"),
    });
    setDraftPane({
      messages: greetMessages(store.draft, tenant.businessName, "draft"),
    });
  }

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-fg">Playground</h3>
          <p className="text-[11px] text-fg-muted">
            Type once on either side to compare {store.current.versionLabel} vs your unsaved draft.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <label
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-xs text-fg-muted",
              "hover:bg-surface-2 hover:text-fg cursor-pointer transition-colors duration-100"
            )}
          >
            <input
              type="checkbox"
              checked={mirror}
              onChange={(e) => setMirror(e.target.checked)}
              className="accent-accent"
            />
            Mirror typing
          </label>
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<RotateCcw className="size-3.5" />}
            onClick={reset}
          >
            Reset chat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <Pane
          title="Live"
          subtitle={store.current.versionLabel}
          messages={livePane.messages}
          onSend={(t) => send("live", t)}
          mirror={mirror}
        />
        <Pane
          title="Draft"
          subtitle={store.isDirty ? "Unsaved changes" : "No changes"}
          highlight={store.isDirty}
          messages={draftPane.messages}
          onSend={(t) => send("draft", t)}
          mirror={mirror}
        />
      </div>
    </Card>
  );
}

function greetMessages(
  settings: PromptSettings,
  business: string,
  side: "live" | "draft"
): PlaygroundMessage[] {
  return [
    {
      id: `m-${side}-greet`,
      role: "bot",
      text: greetingFor(settings, business),
      at: NOW,
    },
  ];
}

function Pane({
  title,
  subtitle,
  highlight = false,
  messages,
  onSend,
  mirror,
}: {
  title: string;
  subtitle: string;
  highlight?: boolean;
  messages: PlaygroundMessage[];
  onSend: (text: string) => void;
  mirror: boolean;
}) {
  const [draft, setDraft] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSend(draft);
    setDraft("");
  }

  return (
    <div className="flex flex-col h-[420px]">
      <div className="px-4 py-2 border-b border-border flex items-baseline justify-between">
        <span className="text-xs font-medium text-fg">{title}</span>
        <span
          className={cn(
            "text-[11px] tabular-nums",
            highlight ? "text-accent font-medium" : "text-fg-subtle"
          )}
        >
          {subtitle}
        </span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.map((m) =>
          m.role === "bot" ? (
            <div key={m.id} className="flex items-start gap-2">
              <span
                aria-hidden
                className="size-6 rounded-full bg-accent-soft text-accent inline-flex items-center justify-center shrink-0 mt-0.5"
              >
                <Bot className="size-3.5" aria-hidden />
              </span>
              <div className="flex flex-col max-w-[80%]">
                <span className="text-[10px] text-fg-subtle leading-none mb-1 tabular-nums">
                  Bot · {formatTime(m.at)}
                </span>
                <div className="px-3 py-2 rounded-md rounded-bl-sm bg-surface-2 text-sm text-fg leading-snug">
                  {m.text}
                </div>
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-2 justify-end">
              <div className="flex flex-col items-end max-w-[80%]">
                <span className="text-[10px] text-fg-subtle leading-none mb-1 tabular-nums">
                  You · {formatTime(m.at)}
                </span>
                <div className="px-3 py-2 rounded-md rounded-br-sm bg-accent-soft text-fg text-sm leading-snug">
                  {m.text}
                </div>
              </div>
            </div>
          )
        )}
      </div>
      <form
        onSubmit={submit}
        className="px-3 py-2 border-t border-border flex items-center gap-2"
      >
        <Input
          placeholder={mirror ? "Type a message (mirrors both sides)…" : "Type a message…"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1"
          aria-label={`Send message to ${title} pane`}
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          leadingIcon={<Send className="size-3.5" />}
          disabled={!draft.trim()}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
