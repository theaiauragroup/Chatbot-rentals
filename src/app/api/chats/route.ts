import { NextResponse } from 'next/server';

export async function GET() {
  // Pointing to leadsdata for now since we know it has real data
  const WEBHOOK_URL = 'https://n8n.srv1147675.hstgr.cloud/webhook/leadsdata';

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`Chats fetch failed: ${response.status}`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : data.leads || [];
    
    return NextResponse.json(list);
  } catch (error: any) {
    console.error('Chats proxy error:', error);
    return NextResponse.json([]);
  }
}

const MOCK_FALLBACK = [
  {
    "Session ID": "SESS-882",
    "Name": "John Doe",
    "Phone": "+1 555-0101",
    "Status": "Hot",
    "Vehicle": "Tesla Model 3",
    "Rental Start Date": "2024-05-20",
    "Rental End Date": "2024-05-25",
    "Value": "$1,200",
    "Last Activity": new Date().toISOString()
  },
  {
    "Session ID": "SESS-883",
    "Name": "Jane Smith",
    "Phone": "+1 555-0102",
    "Status": "Warm",
    "Vehicle": "BMW M4",
    "Rental Start Date": "2024-06-01",
    "Rental End Date": "2024-06-03",
    "Value": "$850",
    "Last Activity": new Date().toISOString()
  }
];
