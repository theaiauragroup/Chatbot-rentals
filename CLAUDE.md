@AGENTS.md

# Specs are the source of truth — keep them live

This project ships from `specs/` first. The directory is the canonical description of every screen, component, type, and interaction. Code follows specs, not the other way around. The README at [specs/README.md](specs/README.md) lists the read order and conventions; the index includes 00–09 (design system, IA, data model, six per-section specs, mock interactions).

## Hard rules (apply on every turn, every conversation)

1. **Before you write or edit any code, check the relevant spec.** Locate the file in `specs/` whose scope covers the change. The mapping by topic:
   - Tokens, primitives, motion, a11y, anti-patterns → [specs/00-design-system.md](specs/00-design-system.md)
   - Routes, sidebar, top bar, global states, URL params → [specs/01-information-architecture.md](specs/01-information-architecture.md)
   - TypeScript types, mock-data shape and volume, formatters → [specs/02-data-model.md](specs/02-data-model.md)
   - Dashboard / Chats / Leads / Tune AI / Fleets / Settings sections → [specs/03–08]
   - Anything wired/stub/nav classification, toast registry → [specs/09-mock-interactions.md](specs/09-mock-interactions.md)

2. **If the user's request changes a spec, update the spec in the same turn that introduces the change.** This is a single, atomic edit:
   - Edit the relevant spec file (purpose, layout, components, states, mock-data deps, interactions, copy, or acceptance checklist — whichever the change touches).
   - Then do the implementation. Never the reverse.
   - If the change spans multiple specs, update each one. Do not let one drift.

3. **If no existing spec covers the change, create a new one.** Use the standard template from [specs/README.md](specs/README.md):
   - Purpose · Layout · Components used · States · Mock data dependencies · Interactions · Copy · Acceptance checklist
   - Name it `specs/NN-<short-slug>.md` using the next free two-digit prefix after the existing files.
   - Add a one-line entry to [specs/README.md](specs/README.md) under "Read order" so the index always reflects reality.

4. **If a small change doesn't fit a section spec but matters (a new convention, a one-off rule, a new global behavior), capture it.** Either:
   - Append it to the most relevant existing spec, or
   - Create a tiny new spec for it (a 30-line spec is fine — better than an undocumented decision).

5. **Code that exists without a spec is a bug.** If you discover code in `src/` that no spec describes, either remove it or write the spec for it. Same rule for libraries added to `package.json` — they belong in the relevant spec's "Components used" or "Library picks" section.

6. **Acceptance checklists in specs are non-negotiable.** A section is not "done" until every box can check. When closing out work on a section, run through its checklist before reporting completion.

## On every user prompt — apply this checklist

- Did this change scope, behavior, or copy? → update the spec first.
- Did this introduce a concept that doesn't appear in any spec? → write a new spec first.
- Did this contradict an existing spec? → reconcile in the spec; the spec wins or gets edited explicitly.
- Did this add a library, dependency, or external service? → record in the relevant spec.

If a turn modifies code without touching `specs/`, that turn is incomplete. State that explicitly to the user, then either update the spec or ask which one should change.

## When the user contradicts a spec

The user always wins, but the resolution is to **edit the spec, then the code** — not to silently override. Sequence:
1. Confirm the new direction with the user if ambiguous.
2. Edit the spec to reflect the new direction (note in the same edit what changed and why if the rationale isn't obvious from context).
3. Then change the code to match.

## Cross-references

When a spec references another spec, use markdown links: `[design system](00-design-system.md)`. When code references a spec convention, prefer comments only when the WHY isn't obvious — names of design tokens, primitive components, etc. should be self-evident from the spec.

## What "spec" does NOT mean

- Not a changelog. Don't append "as of 2026-05-08 we changed…" entries; just edit the spec to reflect the new truth.
- Not a roadmap. Out-of-scope items go in the spec's "Out of scope" / "Coming soon" sections, not as TODOs scattered through the body.
- Not a discussion log. Decisions go in the spec; deliberations stay in the conversation.

## Bottom line

The spec is always current. Every prompt that changes anything also changes the spec, in the same turn, before code runs. If a spec doesn't exist for what's changing, create it. The dashboard is buildable only because `specs/` describes it; let it stay that way.
