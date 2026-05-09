import type { Manager, TenantConfig } from "../types";

export const manager: Manager = {
  id: "mgr_001",
  name: "Sarah Khan",
  role: "owner",
  email: "sarah@aiaurafleets.co",
  phone: "+15555550173",
};

export const tenant: TenantConfig = {
  id: "tnt_001",
  slug: "aiaura-fleets",
  businessName: "AIAURA FLEETS",
  brandColor: "#5B5BD6",
  currency: "USD",
  timezone: "America/Los_Angeles",
  locale: "en-US",
  publicPhone: "+15555550100",
  publicEmail: "hello@aiaurafleets.co",
  address: "123 Wilshire Blvd, Los Angeles, CA 90017",
  notifications: {
    hotLead: true,
    humanHandoff: true,
    bookingInquiry: true,
    dailySummary: true,
    dailySummaryTime: "20:00",
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    managerPhone: "+15555550173",
  },
  twilio: {
    accountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authTokenMasked: "••••••••8c0f",
    senderNumber: "+15552221010",
    isVerified: true,
  },
  widget: {
    position: "bottom-right",
    greetingBadge: "Hi! Need a car?",
    showOnPages: "all",
  },
};
