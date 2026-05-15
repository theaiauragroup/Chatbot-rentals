import { NextResponse } from 'next/server';

export async function GET() {
  const WEBHOOK_URL = 'https://n8n.srv1147675.hstgr.cloud/webhook/leadsdata';

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure we get fresh data
    });

    if (!response.ok) {
      console.warn(`Leads webhook returned ${response.status}. Returning empty list.`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Leads proxy error:', error);
    return NextResponse.json([]);
  }
}
