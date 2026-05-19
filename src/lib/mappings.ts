import { Lead, Vehicle, Chat, VehicleCategory, LeadOutcome, VehicleStatus } from "./types";

export function mapWebhookLead(raw: any): Lead {
  const normalizedRaw: any = {};
  Object.keys(raw).forEach(key => {
    normalizedRaw[key.trim()] = raw[key];
  });

  const find = (...keys: string[]) => {
    const allKeys = Object.keys(normalizedRaw);
    const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const slugifiedTargets = keys.map(slugify);

    for (const rawK in normalizedRaw) {
      const slugifiedRawK = slugify(rawK);
      if (slugifiedTargets.includes(slugifiedRawK)) {
        const val = normalizedRaw[rawK];
        if (val !== undefined && val !== null && String(val).trim() !== "") return val;
      }
    }
    return undefined;
  };

  const leadIdRaw = find("Lead ID", "id", "_id", "ID");
  const nameRaw = find("Full Name", "customer_name", "name", "Customer Name", "Name");
  const phoneRaw = find("Phone Number", "phone", "Customer Phone", "Phone");
  
  const stableId = leadIdRaw ? String(leadIdRaw) : `lead_${(nameRaw || 'anon').replace(/\s+/g, '_').toLowerCase()}_${String(phoneRaw || Date.now()).replace(/\D/g, '')}`;

  return {
    id: stableId,
    chatId: String(find("Tenant ID", "chat_id", "Session ID", "session_id") || ""),
    customerName: nameRaw ? String(nameRaw) : undefined,
    customerPhone: phoneRaw ? String(phoneRaw) : undefined,
    customerEmail: find("Email Address", "email", "Customer Email"),
    temperature: (() => {
      const t = String(find("Status (Hot/Warm/Cold)", "Status", "Temperature", "Lead Temperature", "Lead Status", "temp") || "").toLowerCase();
      if (t.includes("hot")) return "hot";
      if (t.includes("warm")) return "warm";
      if (t.includes("cold")) return "cold";
      return undefined;
    })(),
    rawStatus: find("Status (Hot/Warm/Cold)", "Status", "Temperature", "Lead Temperature", "Lead Status", "temp"),
    outcome: find("Outcome (Open/Booked/Lost/No-response)", "Outcome", "outcome", "Lead Outcome")
      ? (String(find("Outcome (Open/Booked/Lost/No-response)", "Outcome", "outcome", "Lead Outcome")).toLowerCase() as LeadOutcome)
      : undefined,
    trip: {
      pickupDate: find("Rental Start Date", "pickup_date", "Start Date", "Pickup Date"),
      returnDate: find("Rental End Date", "return_date", "End Date", "Return Date"),
      pickupLocation: find("Pickup Location"),
      dropoffLocation: find("Drop-off Location"),
    },
    vehicleInterestIds: find("Vehicle interest", "Car of Interest", "Vehicle", "Car", "Vehicle Name") 
      ? [String(find("Vehicle interest", "Car of Interest", "Vehicle", "Car", "Vehicle Name"))] 
      : [],
    estimatedValueUsd: find("Estimated Value (USD)", "Estimated Value", "value", "Value")
      ? Number(String(find("Estimated Value (USD)", "Estimated Value", "value", "Value")).replace(/[^0-9.]/g, ''))
      : undefined,
    aiSummary: find("Chat Summary", "Summary", "Conversation Summary"),
    managerNotes: find("Manager Notes", "Notes", "Internal Notes"),
    createdAt: find("Created At", "Date", "Created"),
    updatedAt: find("Last Activity At", "Timestamp", "Updated At", "Last Updated"),
    source: "web_widget",
  };
}

export function mapWebhookVehicle(raw: any): Vehicle {
  const normalized: any = {};
  Object.keys(raw).forEach(k => normalized[k.trim()] = raw[k]);

  const find = (...keys: string[]) => {
    const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const slugifiedTargets = keys.map(slugify);
    
    for (const rawK in normalized) {
      const slugifiedRawK = slugify(rawK);
      if (slugifiedTargets.includes(slugifiedRawK)) {
        const val = normalized[rawK];
        if (val !== undefined && val !== null && String(val).trim() !== "") return val;
      }
    }
    return undefined;
  };

  const statusRaw = String(find("Available", "Status", "Is Available") || "available").toLowerCase();
  const isAvailable = statusRaw === "yes" || statusRaw === "true" || statusRaw === "available" || statusRaw === "1";
  const status: VehicleStatus = isAvailable ? "available" : "rented";

  return {
    id: String(find("Car ID", "Vehicle ID", "id", "ID") || `veh_${Math.random().toString(36).substr(2, 9)}`),
    make: String(find("Make", "Brand", "Manufacturer") || "Unknown"),
    model: String(find("Model", "Name") || "Vehicle"),
    year: Number(find("Year", "Model Year") || 2024),
    plate: String(find("Plate", "License Plate", "License", "Registration") || "N/A"),
    category: (String(find("Category", "Type", "Class") || "economy").toLowerCase() as VehicleCategory),
    dailyRateUsd: Number(String(find("Daily Rate (USD)", "Daily Rate", "Rate", "Price", "Cost") || "0").replace(/[^0-9.]/g, '')),
    seats: Number(find("Seats", "Capacity", "Passengers") || 5),
    transmission: (String(find("Transmission", "Gearbox") || "automatic").toLowerCase() as any),
    fuel: (String(find("Fuel Type", "Fuel") || "gasoline").toLowerCase() as any),
    mileageKm: Number(String(find("Mileage Limit (per day)", "Mileage", "Limit", "KM") || "0").replace(/[^0-9.]/g, '')),
    photos: (() => {
      const rawPhotos = String(find("Image URL", "Photos", "Images", "Picture") || "");
      if (!rawPhotos) return [];
      let counter = 0;
      const placeholders: Record<string, string> = {};
      const protectedStr = rawPhotos.replace(/data:image\/[a-zA-Z+]+;base64,/gi, (match) => {
        const placeholder = `___B64_PL_${counter++}___`;
        placeholders[placeholder] = match;
        return placeholder;
      });

      return protectedStr
        .split(",")
        .map((part) => {
          let restored = part.trim();
          Object.keys(placeholders).forEach((pl) => {
            restored = restored.replace(pl, placeholders[pl]);
          });
          if (!restored) return "";
          if (restored.startsWith("data:image/") || restored.startsWith("http://") || restored.startsWith("https://") || restored.startsWith("/")) {
            return restored;
          }
          if (restored.startsWith("/9j/")) return `data:image/jpeg;base64,${restored}`;
          if (restored.startsWith("iVBORw")) return `data:image/png;base64,${restored}`;
          if (restored.startsWith("R0lGOD")) return `data:image/gif;base64,${restored}`;
          if (restored.startsWith("UklGR")) return `data:image/webp;base64,${restored}`;
          return restored;
        })
        .filter(Boolean);
    })(),
    features: String(find("Features", "Options", "Equipment") || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean) as any,
    status,
    blocks: [],
    createdAt: String(find("Created At", "Date", "Added") || new Date().toISOString()),
  };
}

export function mapWebhookChat(raw: any, index: number): Chat {
  const normalizedRaw: any = {};
  Object.keys(raw).forEach(key => {
    normalizedRaw[key.trim()] = raw[key];
  });

  const find = (...keys: string[]) => {
    const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const slugifiedTargets = keys.map(slugify);
    for (const rawK in normalizedRaw) {
      const slugifiedRawK = slugify(rawK);
      if (slugifiedTargets.includes(slugifiedRawK)) {
        const val = normalizedRaw[rawK];
        if (val !== undefined && val !== null && String(val).trim() !== "") return val;
      }
    }
    return undefined;
  };

  const id = String(find("Session ID", "id", "ID", "session_id", "Tenant ID") || `session-${index}`);
  const timestamp = String(find("Last Activity At", "Timestamp", "timestamp", "Updated At", "started_at") || new Date().toISOString());

  return {
    id,
    startedAt: timestamp,
    lastMessageAt: timestamp,
    durationSec: 0,
    customerName: String(find("Full Name", "Name", "customer_name") || "Anonymous"),
    customerPhone: find("Phone Number", "phone", "customer_phone"),
    customerEmail: find("Email Address", "email", "customer_email"),
    messages: [],
    vehicleIdsOfInterest: [],
    finalTemperature: "cold",
    channel: "web_widget",
    outcome: "in_progress"
  };
}
