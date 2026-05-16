import { mapWebhookLead, mapWebhookVehicle, mapWebhookChat } from "./mappings";

const N8N_HOST = 'https://n8n.srv1147675.hstgr.cloud';

export async function getLeads() {
  try {
    const res = await fetch(`${N8N_HOST}/webhook/leadsdata`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const raw = Array.isArray(data) ? data : (data.leads || data.rows || []);
    return raw.map(mapWebhookLead);
  } catch (e) {
    return [];
  }
}

export async function getVehicles() {
  try {
    const res = await fetch(`${N8N_HOST}/webhook/fleet`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const raw = Array.isArray(data) ? data : (data.vehicles || data.fleet || data.rows || []);
    return raw.map(mapWebhookVehicle);
  } catch (e) {
    return [];
  }
}

export async function getChats() {
  try {
    const res = await fetch(`${N8N_HOST}/webhook/chat-history`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const raw = Array.isArray(data) ? data : (data.chats || data.history || data.rows || []);
    return raw.map((item: any, idx: number) => mapWebhookChat(item, idx));
  } catch (e) {
    return [];
  }
}

export async function saveTuneVersion(data: any) {
  try {
    await fetch("https://n8n.srv1147675.hstgr.cloud/webhook/TUNEAI", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "Version ID": data.versionLabel,
        "Tenant ID": "aiaura",
        "Saved At": data.createdAt,
        "Saved By": data.authorName,
        "Tone Setting": data.settings.toneIndex,
        "Greeting Style": data.settings.greetingStyle,
        "Brand Voice Notes": data.settings.brandVoice,
        "Business Rules Snapshot": JSON.stringify(data.settings.businessRules),
        "Knowledge Base Snapshot": data.settings.knowledge,
        "Off-limits Topics": data.settings.offLimitsTopics.join(", "),
        "Escalation Triggers": data.settings.escalationTriggers.join(", "),
        "Prompt Snapshot": JSON.stringify(data.settings),
        "Rolled Back (Y/N)": data.isRollback ? "Y" : "N",
        "Rollback From Version": data.rollbackFrom || ""
      }),
    });
  } catch (error) {
    console.error("Failed to sync tune version to n8n:", error);
  }
}
