import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL is not defined');
      return NextResponse.json(
        { error: 'Chat service is currently unavailable' },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`n8n responded with ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    const text = await response.text();
    let data;
    
    if (contentType && contentType.includes('application/json') && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { reply: text };
      }
    } else {
      data = { reply: text };
    }
    
    // Normalize response from n8n
    const result = Array.isArray(data) ? data[0] : data;

    // ─── Log to History Webhook (Async) ──────────────────────────────────
    const historyWebhookUrl = process.env.N8N_HISTORY_WEBHOOK_URL;
    if (historyWebhookUrl) {
      const commonData = {
        sessionId: body.sessionId,
        startedAt: body.startedAt,
        country: body.metadata?.language || '', // mapping language as a proxy for country/locale
        metadata: body.metadata,
        timestamp: new Date().toISOString(),
      };

      // 1. Log User Message
      fetch(historyWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...commonData,
          role: 'user',
          message: body.message,
        }),
      }).catch(err => console.error('History Log (User) Error:', err));

      // 2. Log Agent Reply
      const botMessage = result.reply || result.message || result.output || result.text || result;
      fetch(historyWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...commonData,
          role: 'agent',
          message: typeof botMessage === 'string' ? botMessage : JSON.stringify(botMessage),
        }),
      }).catch(err => console.error('History Log (Agent) Error:', err));
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Chat Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
