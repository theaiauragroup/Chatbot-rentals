"use client";

import * as React from "react";
import * as Slider from "@radix-ui/react-slider";
import { Bot } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { useTuneStore } from "./TuneStore";
import { tenant } from "@/lib/mock";
import type { PromptSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE_LABELS = [
  "Strict and corporate",
  "Strict and corporate",
  "Strict and corporate",
  "Friendly and professional",
  "Friendly and professional",
  "Warm and conversational",
  "Warm and conversational",
  "Playful and direct",
  "Playful and direct",
  "Very casual, almost text-message",
  "Very casual, almost text-message",
];

const GREETING_TEMPLATES: Record<PromptSettings["greetingStyle"], string> = {
  classic: "Hi, welcome to {business}. How can I help?",
  warm: "Hey! Looking to rent a car? I can help with dates, prices, and availability.",
  concise: "Hi. What dates and what kind of car?",
};

function previewGreeting(s: PromptSettings, businessName: string): string {
  return GREETING_TEMPLATES[s.greetingStyle].replace("{business}", businessName);
}

export function PersonalityTab() {
  const store = useTuneStore();
  const { draft, patchDraft } = store;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Tone */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-fg">Tone of voice</h3>
          <p className="text-xs text-fg-muted mt-1">
            How does your bot sound to customers?
          </p>
          <div className="mt-5">
            <Slider.Root
              value={[draft.toneIndex]}
              onValueChange={([v]) => patchDraft({ toneIndex: v })}
              min={0}
              max={10}
              step={1}
              className="relative flex items-center select-none touch-none w-full h-5"
            >
              <Slider.Track className="bg-border relative grow rounded-full h-1">
                <Slider.Range className="absolute bg-accent rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className={cn(
                  "block size-4 bg-surface shadow-sm border border-border-strong rounded-full",
                  "hover:bg-accent-soft hover:border-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                )}
                aria-label="Tone"
              />
            </Slider.Root>
            <div className="mt-2 flex items-center justify-between text-[11px] text-fg-subtle">
              <span>Formal</span>
              <span className="text-fg font-medium tabular-nums">
                {draft.toneIndex} · {TONE_LABELS[draft.toneIndex] ?? "—"}
              </span>
              <span>Casual</span>
            </div>
          </div>
        </Card>

        {/* Greeting */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-fg">Greeting style</h3>
          <p className="text-xs text-fg-muted mt-1">
            The first message your bot sends.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {(Object.keys(GREETING_TEMPLATES) as Array<keyof typeof GREETING_TEMPLATES>).map(
              (g) => {
                const active = draft.greetingStyle === g;
                return (
                  <label
                    key={g}
                    className={cn(
                      "flex items-start gap-3 px-3 py-2.5 rounded-md border cursor-pointer",
                      "transition-colors duration-100",
                      active
                        ? "border-accent bg-accent-soft"
                        : "border-border bg-surface hover:border-border-strong"
                    )}
                  >
                    <input
                      type="radio"
                      name="greeting"
                      checked={active}
                      onChange={() => patchDraft({ greetingStyle: g })}
                      className="mt-1 accent-accent"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-fg capitalize">{g}</p>
                      <p className="text-[11px] text-fg-muted mt-0.5">
                        “{GREETING_TEMPLATES[g].replace("{business}", tenant.businessName)}”
                      </p>
                    </div>
                  </label>
                );
              }
            )}
          </div>
        </Card>

        {/* Brand voice */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-fg">Brand voice notes</h3>
          <p className="text-xs text-fg-muted mt-1">
            Anything specific about your brand the bot should mirror?
          </p>
          <Textarea
            value={draft.brandVoice}
            onChange={(e) => patchDraft({ brandVoice: e.target.value })}
            className="mt-3 text-xs"
            placeholder="Never use slang. Reference our 24/7 roadside support when relevant."
          />
        </Card>
      </div>

      {/* Live preview */}
      <div className="lg:col-span-5">
        <Card className="p-5 sticky top-20">
          <p className="text-[11px] font-medium text-fg-subtle uppercase tracking-wider">
            Preview · not sent
          </p>
          <div className="mt-3 flex gap-2 items-start">
            <span
              aria-hidden
              className="size-7 rounded-full bg-accent-soft text-accent inline-flex items-center justify-center shrink-0"
            >
              <Bot className="size-4" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-[11px] text-fg-subtle leading-none mb-1">
                Bot · greeting
              </p>
              <div className="px-3 py-2 rounded-md rounded-bl-sm bg-surface-2 text-sm text-fg leading-snug">
                {previewGreeting(draft, tenant.businessName)}
              </div>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-fg-subtle">
            Tone {draft.toneIndex}/10 · {TONE_LABELS[draft.toneIndex] ?? ""}
          </p>
        </Card>
      </div>
    </div>
  );
}
