import type { PromptVersion } from "../types";

const baseSettings = {
  toneIndex: 4,
  greetingStyle: "warm" as const,
  brandVoice:
    "Never use slang. Address customers by first name once they share it. Reference our 24/7 roadside support when relevant.",
  businessRules: {
    operatingHours: "Mon–Sun 8:00–22:00",
    depositPolicyUsd: 200,
    multiDayDiscountPct: 10,
    minRentalDays: 1,
    minDriverAge: 21,
  },
  knowledge:
    "## Cancellation policy\nFree cancellation up to 24 hours before pickup. After that, 50% charge.\n\n## Fuel rules\nReturn with the same fuel level. Otherwise $9/gallon penalty.\n\n## Mileage limits\n200 miles/day included; $0.35/mile after.",
  offLimitsTopics: ["insurance disputes", "refunds beyond 7 days", "custom long-term contracts", "claims paperwork"],
  escalationTriggers: ["talk to a person", "speak with manager", "this is urgent", "I want a refund", "your bot doesn't understand"],
};

export const promptVersions: PromptVersion[] = [
  {
    id: "ver_006",
    versionLabel: "v1.4.0",
    createdAt: "2026-05-08T11:42:00-07:00",
    authorName: "Sarah Khan",
    summary: "Tightened price floor; added child-seat upsell on family bookings.",
    settings: baseSettings,
    isCurrent: true,
  },
  {
    id: "ver_005",
    versionLabel: "v1.3.2",
    createdAt: "2026-05-05T09:15:00-07:00",
    authorName: "Daniel Lee",
    summary: "Expanded off-limits topics for insurance disputes.",
    settings: { ...baseSettings, offLimitsTopics: ["insurance disputes", "refunds", "claims paperwork"] },
    isCurrent: false,
  },
  {
    id: "ver_004",
    versionLabel: "v1.3.1",
    createdAt: "2026-04-28T14:08:00-07:00",
    authorName: "Sarah Khan",
    summary: "Reverted greeting to warm style after testing concise underperformed.",
    settings: { ...baseSettings, greetingStyle: "concise" },
    isCurrent: false,
  },
  {
    id: "ver_003",
    versionLabel: "v1.3.0",
    createdAt: "2026-04-20T10:31:00-07:00",
    authorName: "Daniel Lee",
    summary: "Lowered tone index from 6 to 4 for more professional voice.",
    settings: { ...baseSettings, toneIndex: 6 },
    isCurrent: false,
  },
  {
    id: "ver_002",
    versionLabel: "v1.2.0",
    createdAt: "2026-04-09T16:55:00-07:00",
    authorName: "Sarah Khan",
    summary: "Added multi-day discount language to bot replies.",
    settings: { ...baseSettings, businessRules: { ...baseSettings.businessRules, multiDayDiscountPct: 0 } },
    isCurrent: false,
  },
  {
    id: "ver_001",
    versionLabel: "v1.1.0",
    createdAt: "2026-03-22T12:00:00-07:00",
    authorName: "Sarah Khan",
    summary: "Initial production release.",
    settings: { ...baseSettings, knowledge: "" },
    isCurrent: false,
  },
];

export const currentPromptSettings = promptVersions.find((v) => v.isCurrent)!.settings;
