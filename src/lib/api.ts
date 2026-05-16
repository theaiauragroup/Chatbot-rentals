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
