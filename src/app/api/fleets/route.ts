import { NextResponse } from 'next/server';

export async function GET() {
  const WEBHOOK_URL = 'https://n8n.srv1147675.hstgr.cloud/webhook/fleet';

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`Fleets webhook returned ${response.status}. Returning empty list.`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fleets proxy GET error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const WEBHOOK_URL = 'https://n8n.srv1147675.hstgr.cloud/webhook/fleetdata';

  try {
    const body = await req.json();
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Fleets webhook POST returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fleets proxy POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
