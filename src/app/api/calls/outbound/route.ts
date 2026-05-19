import { NextResponse } from 'next/server';

const FETCH_URL = 'https://n8n.srv1147675.hstgr.cloud/webhook/outbound_call';
const EDIT_URL = 'https://n8n.srv1147675.hstgr.cloud/webhook/OUT_E';
const DELETE_URL = 'https://n8n.srv1147675.hstgr.cloud/webhook/OUTBOUND-D';

export async function GET() {
  try {
    const response = await fetch(FETCH_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`Outbound fetch returned ${response.status}`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Outbound GET proxy error:', error);
    return NextResponse.json([]);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(EDIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn(`Outbound edit webhook returned ${response.status}`);
      return NextResponse.json({ success: false, status: response.status });
    }

    let result = { success: true };
    try {
      result = await response.json();
    } catch {
      // webhook may return empty or non-JSON
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Outbound PUT proxy error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(DELETE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn(`Outbound delete webhook returned ${response.status}`);
      return NextResponse.json({ success: false, status: response.status });
    }

    let result = { success: true };
    try {
      result = await response.json();
    } catch {
      // empty response
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Outbound DELETE proxy error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
