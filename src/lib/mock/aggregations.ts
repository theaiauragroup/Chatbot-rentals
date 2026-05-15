import type { ActivityEvent, Lead, Vehicle } from "../types";
import { chats } from "./chats";
import { leads } from "./leads";
import { vehicles } from "./vehicles";

const BOOKING_OUTCOMES = new Set(["booked", "deposit_paid", "deal_closed"]);

export const recentBookings: Lead[] = leads
  .filter((l) => l.outcome && BOOKING_OUTCOMES.has(l.outcome))
  .sort((a, b) => {
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeB - timeA;
  });

export const totalBookedValueUsd: number = recentBookings.reduce(
  (acc, l) => acc + (l.estimatedValueUsd || 0),
  0
);

export const liveChatsNow: number = 0;
export const newLeadsLastHour: number = 0;

export interface TopCarRow {
  vehicle: Vehicle;
  revenueUsd: number;
  bookings: number;
}

export const topPerformingCars: TopCarRow[] = [];

export const popularCars: any[] = [];

export const todaysHotLeads: Lead[] = [];

export const recentActivity: ActivityEvent[] = [];
