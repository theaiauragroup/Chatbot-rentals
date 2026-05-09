export const toasts = {
  notImplemented: (what: string) => `${what} wired in pass 2.`,
  copied: (label = "Copied to clipboard.") => label,
  exported: (n: number, kind: "chats" | "leads" | "vehicles") =>
    `Exported ${n} ${kind}.`,
  leadOutcome: (label: string) => `Lead marked as ${label}.`,
  leadTemperature: (label: string) => `Temperature set to ${label}.`,
  bookingAdded: (vehicle: string) =>
    `Booking added to ${vehicle}'s calendar.`,
  versionSaved: (v: string) => `Saved as v${v}. Bot updated.`,
  rolledBack: (v: string) => `Rolled back to v${v}.`,
  settingsSaved: "Settings saved.",
  testSmsSent: "Test SMS sent. Check your phone.",
  vehicleAdded: "Vehicle added.",
  vehicleUpdated: "Vehicle updated.",
  vehicleDuplicated: "Vehicle duplicated.",
  phoneCopied: "Phone copied.",
  callPlaceholder: (phone: string) =>
    `We'd dial ${phone} — wired in pass 2.`,
};
