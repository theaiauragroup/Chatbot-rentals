import { NextResponse } from 'next/server';

const FETCH_URL = 'https://n8n.srv1147675.hstgr.cloud/webhook/inbound_fetch';
const EDIT_URL = 'https://n8n.srv1147675.hstgr.cloud/webhook/INBOUND_E';
const DELETE_URL = 'https://n8n.srv1147675.hstgr.cloud/webhook/inbound_delete';

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
      console.warn(`Inbound fetch returned ${response.status}`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Inbound GET proxy error:', error);
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
      console.warn(`Inbound edit webhook returned ${response.status}`);
      return NextResponse.json({ success: false, status: response.status });
    }

    let result = { success: true };
    try {
      result = await response.json();
    } catch {
      // webhook may return empty response or non-JSON
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Inbound PUT proxy error:', error);
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
      console.warn(`Inbound delete webhook returned ${response.status}`);
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
    console.error('Inbound DELETE proxy error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
