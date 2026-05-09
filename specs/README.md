# Admin Dashboard — Specs

Source of truth for the **car rental chatbot admin dashboard** (Pass 1: static UI, mock data only).
Implementation must trace 1:1 to these specs. No improvising during build — if a spec is wrong or
missing detail, amend the spec first, then implement.

Source product PDF: `/Users/fatima/Desktop/Car Rental Chatbot.pdf` (AIAURA Solutions, 16 pages).

## Read order

1. [00-design-system.md](00-design-system.md) — tokens, primitives, motion, a11y, anti-patterns
2. [01-information-architecture.md](01-information-architecture.md) — sitemap, routes, shell, global states
3. [02-data-model.md](02-data-model.md) — TypeScript types + mock-data plan
4. [03-section-dashboard.md](03-section-dashboard.md) — KPIs, charts, activity feed
5. [04-section-chats.md](04-section-chats.md) — chat history table + transcript view
6. [05-section-leads.md](05-section-leads.md) — kanban + table + drawer
7. [06-section-tune-ai.md](06-section-tune-ai.md) — bot tuning tabs + playground + version history
8. [07-section-fleets.md](07-section-fleets.md) — fleet grid, vehicle detail, calendar
9. [08-section-settings.md](08-section-settings.md) — profile, notifications, Twilio, business, widget, team
10. [09-mock-interactions.md](09-mock-interactions.md) — what's wired, what stubs to a toast

## Scope of this pass

- **In:** all 6 dashboard sections, complete static UI, mock data, accessible primitives, the visual system.
- **Out:** customer chat widget, public marketing site, real OpenAI/Twilio/Postgres, auth, multi-tenant routing,
  dark mode, real-time features. (Schema-ready in types where relevant; not enforced.)

## Convention for amending a spec

- Specs change as we build. Edit the relevant spec.md, commit with message `spec(<file>): <change>`.
- Never let code drift from spec — if the build needed something not in the spec, add it to the spec retroactively in the same change.
- Each spec ends with an **Acceptance checklist**. The build of that section is "done" only when every box checks.

## Spec template

Every section spec follows this structure:

1. **Purpose** — 1–2 sentences
2. **Layout** — ASCII wireframe at 1440 width; notes for 1280 / 1920 reflows
3. **Components used** — file paths in `src/components/...`
4. **States** — loading / empty / populated / error / edge cases
5. **Mock data dependencies** — files in `src/lib/mock/`
6. **Interactions** — what's clickable, mock behavior vs stub-toast
7. **Copy** — every label, button, and empty-state line (final, not lorem)
8. **Acceptance checklist** — objective build-completion criteria
