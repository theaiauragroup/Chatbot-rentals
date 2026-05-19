import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_URL = 'https://n8n.srv1147675.hstgr.cloud/webhook/calender';

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
      console.warn(`Calendar webhook POST returned status ${response.status}`);
      // Return a 200 even if n8n returns a text reply instead of json
      const text = await response.text();
      try {
        return NextResponse.json(JSON.parse(text));
      } catch {
        return NextResponse.json({ success: true, reply: text });
      }
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: true, reply: text };
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Calendar proxy POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
