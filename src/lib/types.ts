// ─── Primitive aliases ──────────────────────────────────────────────────────
export type ID = string;
export type ISODate = string; // 'YYYY-MM-DD'
export type ISODateTime = string; // 'YYYY-MM-DDTHH:mm:ssZ'

// ─── Lead ───────────────────────────────────────────────────────────────────
export type LeadTemperature = "hot" | "warm" | "cold";

/**
 * Manager-managed lifecycle status. `booked` triggers the "Add booking to
 * vehicle calendar" modal. `deal_closed` is the terminal closed-won state
 * (vehicle picked up and paid in full). `lost` / `no_response` are closed-lost
 * terminals that don't touch the calendar.
 */
export type LeadOutcome =
  | "open"
  | "working_on"
  | "contacted"
  | "in_process"
  | "quoted"
  | "call_booked"
  | "deposit_paid"
  | "booked"
  | "deal_closed"
  | "lost"
  | "no_response";

export interface Lead {
  id: ID;
  chatId: ID;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  temperature: LeadTemperature;
  outcome: LeadOutcome;
  trip: {
    pickupDate: ISODate;
    returnDate: ISODate;
    pickupLocation?: string;
    dropoffLocation?: string;
  };
  vehicleInterestIds: ID[];
  estimatedValueUsd: number;
  managerNotes?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  source: "web_widget";
}

// ─── Vehicle ────────────────────────────────────────────────────────────────
export type VehicleCategory = "economy" | "compact" | "suv" | "luxury" | "van";
export type VehicleStatus = "available" | "rented" | "maintenance" | "retired";
export type Transmission = "automatic" | "manual";
export type Fuel = "gasoline" | "diesel" | "hybrid" | "electric";
export type Feature =
  | "ac"
  | "gps"
  | "bluetooth"
  | "sunroof"
  | "child_seat"
  | "all_wheel_drive"
  | "apple_carplay"
  | "heated_seats";

export interface BookingRange {
  id: ID;
  start: ISODate;
  end: ISODate;
  /** HH:mm pickup time on the start date (optional). */
  startTime?: string;
  /** HH:mm return time on the end date (optional). */
  endTime?: string;
  reason: "rented" | "maintenance" | "blocked";
  leadId?: ID;
}

export interface Vehicle {
  id: ID;
  make: string;
  model: string;
  year: number;
  plate: string;
  category: VehicleCategory;
  dailyRateUsd: number;
  seats: number;
  transmission: Transmission;
  fuel: Fuel;
  mileageKm: number;
  photos: string[];
  features: Feature[];
  status: VehicleStatus;
  blocks: BookingRange[];
  createdAt: ISODateTime;
}

// ─── Chat ───────────────────────────────────────────────────────────────────
export type MessageRole = "user" | "assistant" | "system";

export interface AiDecision {
  intent:
    | "greeting"
    | "browsing"
    | "pricing_inquiry"
    | "availability_check"
    | "booking_intent"
    | "objection"
    | "handoff_request"
    | "off_topic";
  confidence: number;
  tempShift?: LeadTemperature;
  collectedFields?: string[];
}

export interface Message {
  id: ID;
  chatId: ID;
  role: MessageRole;
  text: string;
  sentAt: ISODateTime;
  aiDecision?: AiDecision;
}

export interface Chat {
  id: ID;
  startedAt: ISODateTime;
  lastMessageAt: ISODateTime;
  endedAt?: ISODateTime;
  durationSec: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  messages: Message[];
  leadId?: ID;
  vehicleIdsOfInterest: ID[];
  finalTemperature: LeadTemperature;
  channel: "web_widget";
  countryCode?: string;
  outcome?: "in_progress" | "closed" | "handed_off";
}

// ─── Notification ───────────────────────────────────────────────────────────
export type NotificationType =
  | "hot_lead"
  | "human_handoff"
  | "booking_inquiry"
  | "daily_summary"
  | "system";

export interface Notification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: ISODateTime;
  read: boolean;
  refLeadId?: ID;
  refChatId?: ID;
}

// ─── Analytics ──────────────────────────────────────────────────────────────
export interface ChartPoint {
  date: ISODate;
  chats: number;
  hot: number;
  warm: number;
  cold: number;
  bookings: number;
  revenueUsd: number;
}

export interface KpiSummary {
  rangeLabel: string;
  totalChats: number;
  newLeads: { hot: number; warm: number; cold: number };
  conversionRatePct: number;
  pipelineValueUsd: number;
  avgChatDurationSec: number;
  bookings: number;
  deltas: {
    totalChats: number;
    newLeads: number;
    conversionRatePct: number;
    pipelineValueUsd: number;
    avgChatDurationSec: number;
    bookings: number;
  };
}

export interface PeakHourCell {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  hour: number;
  count: number;
}

export type ActivityEventType =
  | "new_chat"
  | "new_hot_lead"
  | "temp_change"
  | "booking_closed"
  | "handoff_request"
  | "chat_ended";

export interface ActivityEvent {
  id: ID;
  type: ActivityEventType;
  text: string;
  at: ISODateTime;
  refLeadId?: ID;
  refChatId?: ID;
  refVehicleId?: ID;
}

// ─── Tune AI ────────────────────────────────────────────────────────────────
export interface PromptSettings {
  toneIndex: number; // 0..10
  greetingStyle: "classic" | "warm" | "concise";
  brandVoice: string;
  businessRules: {
    operatingHours: string;
    depositPolicyUsd: number;
    multiDayDiscountPct: number;
    minRentalDays: number;
    minDriverAge: number;
  };
  knowledge: string;
  offLimitsTopics: string[];
  escalationTriggers: string[];
}

export interface PromptVersion {
  id: ID;
  versionLabel: string;
  createdAt: ISODateTime;
  authorName: string;
  summary: string;
  settings: PromptSettings;
  isCurrent: boolean;
}

// ─── Manager / tenant ───────────────────────────────────────────────────────
export interface Manager {
  id: ID;
  name: string;
  role: "owner" | "manager";
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface TenantConfig {
  id: ID;
  slug: string;
  businessName: string;
  logoUrl?: string;
  brandColor: string;
  currency: "USD";
  timezone: string;
  locale: string;
  publicPhone: string;
  publicEmail: string;
  address: string;
  notifications: {
    hotLead: boolean;
    humanHandoff: boolean;
    bookingInquiry: boolean;
    dailySummary: boolean;
    dailySummaryTime: string;
    quietHoursStart: string;
    quietHoursEnd: string;
    managerPhone: string;
  };
  twilio: {
    accountSid: string;
    authTokenMasked: string;
    senderNumber: string;
    isVerified: boolean;
  };
  widget: {
    position: "bottom-right";
    greetingBadge: string;
    showOnPages: "all";
  };
}

// ─── Layout constants ───────────────────────────────────────────────────────
export const LAYOUT = {
  SIDEBAR_WIDTH: 240,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  TOPBAR_HEIGHT: 56,
  CONTENT_MAX_WIDTH: 1440,
  CONTENT_PADDING_X: 32,
  CONTENT_PADDING_Y: 24,
  PAGE_BOTTOM_PADDING: 48,
  DRAWER_WIDTH: 480,
  DRAWER_WIDTH_LARGE: 560,
  MODAL_WIDTH_CONFIRM: 480,
  MODAL_WIDTH_FORM: 640,
} as const;
