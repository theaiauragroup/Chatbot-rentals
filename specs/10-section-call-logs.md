# 10. Call Logs Section Spec

## 1. Purpose
Provides administrative users with a comprehensive dashboard to view, analyze, search, filter, and audit inbound and outbound phone call engagements handled by the AIAURA digital concierge or transferred to humans.

## 2. Layout
ASCII wireframe at 1440 width:
```
+------------------------------------------------------------------------------------------------+
|  Brand Logo  |  Call Logs                                              [ Inbound ] [ Outbound ] |
|  (Sidebar)   |  Real-time visual tracking of voice engagement...                               |
|              +---------------------------------------------------------------------------------+
|  Dashboard   |  [ Total Calls: X ]   [ Success Rate: X% ]   [ Avg Dur: X s ]   [ Positive: X% ]|
|  Chats       +---------------------------------------------------------------------------------+
|  Leads       |  [ Search Input      ]  Sentiment: [ All   v ]  Status/Outcome: [ All      v ]   |
|  Fleets      +---------------------------------------------------------------------------------+
|  Settings    |  Lead ID  | Customer | Rental Info  | Routes/Indicators | AI Summary | Actions  |
|              |  ---------+----------+--------------+-------------------+------------+--------  |
|              |  L-AHMED  | Ahmed K. | BMW 5 Series | Austin Airport    | Checked... | [Play] > |
|              |  L-SOFIA  | Sofia R. | Toyota RAV4  | Downtown Office   | Inquired.. | [Play] > |
+--------------+---------------------------------------------------------------------------------+
```

## 3. Components used
- **Main Route Page:** `src/app/(dashboard)/calls/page.tsx`
- **Main View Component:** `src/components/calls/CallsView.tsx`
- **Shared Primitives:**
  - `src/components/ui/Card.tsx`
  - `src/components/ui/Badge.tsx`
  - `src/components/ui/Button.tsx`
  - `src/components/ui/Drawer.tsx`
  - `src/components/data/SearchInput.tsx`

## 4. States
- **Inbound Tab Populated:** Displays Inbound KPI cards, search, status dropdown filter, and Inbound Call table.
- **Outbound Tab Populated:** Displays Outbound KPI cards, search, call outcome dropdown filter, and Outbound Call table.
- **Empty States:** Triggered when search/filters return 0 matching items. Shows a clean centered icon with "No calls match your filters" and a "Clear Filters" reset button.
- **Call Drawer Expanded:** Opens a slide-out drawer presenting:
  - Customer contact details.
  - Interactive Call Recording Player with seeker bar and audio visualizer waves.
  - Bulleted AI Call Insights panel.
  - Full structured call transcript message bubbles.

## 5. Mock data dependencies
- **Types:** `InboundCall` and `OutboundCall` in `src/lib/types.ts`
- **Data Source:** `mockInboundCalls` and `mockOutboundCalls` in `src/lib/mock/calls.ts`
- **Barrel Export:** `src/lib/mock/index.ts`

## 6. Interactions
- **Tab Switching:** Click `Inbound Calls` or `Outbound Calls` to toggle views. Clears all filter states.
- **Table Row Click:** Opens the corresponding slide-out Drawer from the right.
- **Search & Filter:** Instant local client-side filtering on keystroke (search fields: Lead ID, Name, Phone Number).
- **Simulated Player Controls:** 
  - Play/Pause toggle plays the audio track from the mock sound URL using the browser Audio engine.
  - Seeking slider updates track cursor.
  - Audio visualizer waves animate dynamically while the audio is actively playing.
  - Speaker icon toggles mute.
- **Drawer Close:** Click outside or the overlay close indicator to slide the panel back.
- **Edit Call Log Mode:** Click "Edit Log" in the drawer header toolbar to toggle metadata details, AI summaries, and transcript fields into interactive inputs, drop-downs, and textareas. Reverts cleanly on "Cancel".
- **Update Call Log (Save):** Click "Update (Save)" to merge all inputs into the dashboard state tree, exit edit mode, and trigger a success alert notification.
- **Delete Call Log:** Click "Delete Log" to reveal a secure, styled confirm/cancel alert block. Clicking "Yes, Delete" dispatches the record removal from the active list view, issues a danger notification, and automatically closes the slide-over drawer.

## 7. Copy
- **Header Title:** "Call Logs"
- **Header Description:** "Real-time visual tracking of voice engagement, transcription, and agent performance."
- **Empty State Title:** "No inbound calls match your filters" / "No outbound calls match your filters"
- **Metadata Column Titles (Inbound):** Lead ID, Date Captured, Full Name, Phone Number, Email Address, Vehicle Interest, Rental Dates, Pickup Location, Dropoff Location, Call Successful, User Sentiment, Transfer Requested, Next Action, Conversation Summary, Call Transcript, Call Summary (AI), Lead Source, Status, Call Recording URL, Call Duration.
- **Metadata Column Titles (Outbound):** Lead ID, Date Captured, Full Name, Phone Number, Email Address, Vehicle Interest, Rental Dates, Contact Made, Call Outcome, User Sentiment, Still Interested, Follow-up Scheduled, Do Not Call, Conversation Summary, Call Transcript, Call Summary (AI), Lead Source, Call Recording URL, Call Duration.
- **Toast Notifications:**
  - Update: "Call log updated successfully!"
  - Delete: "Call log deleted successfully!"
  - Delete Confirm Alert Title: "Delete Call Log?"
  - Delete Confirm Alert Body: "Are you sure you want to delete this call log? This will remove it from the active dashboard feed."

## 8. Acceptance checklist
- [x] Inbound Calls view displays all specified Inbound Call metadata columns in tabular or details drawer formats.
- [x] Outbound Calls view displays all specified Outbound Call metadata columns in tabular or details drawer formats.
- [x] Symmetrical premium minimal layout with responsive cards and clean borders.
- [x] Interactive Tabs toggle correctly between Inbound and Outbound logs.
- [x] Search filters instantly by Name, Phone, or Lead ID.
- [x] Sentiment and status/outcome filters function correctly.
- [x] Interactive drawer slides out from the right showing transcripts and full metadata on row click.
- [x] Custom audio player controls mock audio playback and features animated visualizer waves.
- [x] "Edit Log" mode correctly reveals styled inputs for all 20 inbound / 19 outbound metadata columns (including summaries and transcripts).
- [x] "Update (Save)" button correctly synchronizes edits back to the dashboard state and triggers success toasts.
- [x] "Delete Log" button correctly triggers inline confirmation panels and filters out deleted records dynamically from active grids.
- [x] Zero compilation errors when building the project.
