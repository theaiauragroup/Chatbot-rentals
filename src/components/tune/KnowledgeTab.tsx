"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTuneStore } from "./TuneStore";

const SNIPPETS: Array<{ label: string; body: string }> = [
  {
    label: "Cancellation policy",
    body: "## Cancellation policy\nFree cancellation up to 24 hours before pickup. After that, 50% charge.\n",
  },
  {
    label: "Fuel rules",
    body: "## Fuel rules\nReturn with the same fuel level. Otherwise $9/gallon penalty.\n",
  },
  {
    label: "Mileage limits",
    body: "## Mileage limits\n200 miles/day included; $0.35/mile after.\n",
  },
  {
    label: "Damage process",
    body: "## Damage process\nReport any new damage within 24 hours. Inspection within 48 hours of return.\n",
  },
];

const MAX_CHARS = 8000;

export function KnowledgeTab() {
  const { draft, patchDraft } = useTuneStore();
  const ref = React.useRef<HTMLTextAreaElement>(null);

  function insert(snippet: string) {
    const ta = ref.current;
    if (!ta) {
      patchDraft({ knowledge: draft.knowledge + "\n" + snippet });
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = draft.knowledge.slice(0, start);
    const after = draft.knowledge.slice(end);
    const next = before + (start > 0 && before.at(-1) !== "\n" ? "\n" : "") + snippet + after;
    patchDraft({ knowledge: next });
    requestAnimationFrame(() => {
      const pos = (before + snippet).length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  }

  const charCount = draft.knowledge.length;
  const overLimit = charCount > MAX_CHARS;

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-fg">Knowledge base</h3>
      <p className="text-xs text-fg-muted mt-1">
        The bot treats anything in this field as authoritative. Be specific. Avoid contradictions with Business rules.
      </p>

      {/* Quick-insert toolbar */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SNIPPETS.map((s) => (
          <Button
            key={s.label}
            variant="secondary"
            size="sm"
            leadingIcon={<Plus className="size-3" />}
            onClick={() => insert(s.body)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* Editor */}
      <textarea
        ref={ref}
        value={draft.knowledge}
        onChange={(e) => patchDraft({ knowledge: e.target.value })}
        spellCheck={false}
        className="mt-3 block w-full min-h-[320px] px-3 py-2 rounded-sm border border-border bg-surface font-mono text-xs text-fg outline-none focus:ring-2 focus:ring-accent resize-y"
        placeholder="## Cancellation policy&#10;Free cancellation up to 24 hours before pickup..."
      />

      <div className="mt-1.5 flex items-center justify-between text-[11px] text-fg-subtle">
        <span>Markdown is allowed. The bot ingests this verbatim.</span>
        <span className={overLimit ? "text-danger font-medium" : "tabular-nums"}>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>
    </Card>
  );
}
