import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ISODate, ISODateTime, LeadOutcome, LeadTemperature } from "./types";

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(...classes));
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatUsd(amount: number | undefined | null, opts: { cents?: boolean } = {}) {
  if (amount === undefined || amount === null) return "";
  return opts.cents ? usdCents.format(amount) : usd.format(amount);
}

export function parseDate(d: string): Date {
  if (!d || typeof d !== "string") return new Date();
  
  // Handle DD-MM-YYYY or DD/MM/YYYY
  const sep = d.includes("-") ? "-" : d.includes("/") ? "/" : null;
  if (sep) {
    const parts = d.split(sep);
    if (parts[0].length === 2 && parts[2].length === 4) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
  }
  
  const iso = d.includes("T") ? d : d + "T00:00:00";
  const date = new Date(iso);
  return isNaN(date.getTime()) ? new Date() : date;
}

export function formatDate(d: ISODate | undefined | null, opts?: Intl.DateTimeFormatOptions) {
  if (!d) return "";
  const date = parseDate(d);
  return date.toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric" });
}

export function formatDateRange(s: ISODate, e: ISODate) {
  const start = parseDate(s);
  const end = parseDate(e);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.toLocaleString("en-US", { month: "short" })} ${start.getDate()}–${end.getDate()}`;
  }
  return `${start.toLocaleString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleString("en-US", { month: "short", day: "numeric" })}`;
}

export function formatTime(dt: ISODateTime) {
  const date = new Date(dt);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDateTime(dt: ISODateTime) {
  return `${formatDate(dt.slice(0, 10) as ISODate)} ${formatTime(dt)}`;
}

export function formatRelative(dt: ISODateTime | undefined | null, now: Date = new Date()) {
  if (!dt) return "";
  const then = new Date(dt);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dt.slice(0, 10) as ISODate);
}

export function formatDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
}

export function formatPhone(e164: string) {
  if (typeof e164 !== "string") return "";
  const digits = e164.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return e164;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const TEMP_LABEL: Record<LeadTemperature, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
};
export function tempLabel(t: LeadTemperature) {
  return TEMP_LABEL[t];
}

const OUTCOME_LABEL: Record<LeadOutcome, string> = {
  open: "Open",
  working_on: "Working on",
  contacted: "Contacted",
  in_process: "In process",
  quoted: "Quoted",
  call_booked: "Call booked",
  deposit_paid: "Deposit paid",
  booked: "Booked",
  deal_closed: "Deal closed",
  lost: "Lost",
  no_response: "No response",
};
export function outcomeLabel(o: LeadOutcome) {
  return OUTCOME_LABEL[o];
}

/**
 * Static "now" used by mock data so the dashboard always renders against
 * a deterministic clock instead of the real wall clock. Set to today
 * (project date 2026-05-08, 14:30 PT).
 */
export const NOW_DEFAULT = new Date().toISOString();
export const NOW_DATE = new Date();

export function daysBetween(a: ISODate | undefined | null, b: ISODate | undefined | null) {
  if (!a || !b) return 0;
  const ms = parseDate(b).getTime() - parseDate(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function addDays(d: ISODate, n: number): ISODate {
  const date = parseDate(d);
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
}
