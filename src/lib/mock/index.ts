export { manager, tenant } from "./manager";
export { vehicles, vehicleById } from "./vehicles";
export { leads, leadById } from "./leads";
export { chats, chatById } from "./chats";
export {
  chartSeries30d,
  chartSeries7d,
  chartSeriesToday,
  kpiSummary7d,
  kpiSummary30d,
  kpiSummaryToday,
  peakHours,
} from "./kpis";
export { notifications, unreadCount } from "./notifications";
export { promptVersions, currentPromptSettings } from "./versions";
export {
  popularCars,
  todaysHotLeads,
  recentActivity,
  topPerformingCars,
  recentBookings,
  totalBookedValueUsd,
  liveChatsNow,
  newLeadsLastHour,
} from "./aggregations";
export type { TopCarRow } from "./aggregations";
