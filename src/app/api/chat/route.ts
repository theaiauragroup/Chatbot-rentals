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

    // Fetch real-time vehicles and blocks to enrich AI context
    let enrichedBody = { ...body };
    try {
      const { getVehicles } = require('@/lib/api');
      const vehicles = await getVehicles();
      
      const fleetAvailabilityContext = vehicles.map((v: any) => {
        const blocksText = v.blocks.length > 0 
          ? v.blocks.map((b: any) => `- Blocked from ${b.start}${b.startTime ? ` ${b.startTime}` : ''} to ${b.end}${b.endTime ? ` ${b.endTime}` : ''} (Reason: ${b.reason})`).join('\n')
          : '- Available on all dates (No blocks)';
        return `Car: ${v.make} ${v.model} ${v.year} (ID: ${v.id}, Plate: ${v.plate}, Daily Rate: $${v.dailyRateUsd}, Status: ${v.status})\n${blocksText}`;
      }).join('\n\n');

      enrichedBody = {
        ...body,
        fleet: vehicles.map((v: any) => ({
          id: v.id,
          make: v.make,
          model: v.model,
          year: v.year,
          plate: v.plate,
          category: v.category,
          dailyRateUsd: v.dailyRateUsd,
          status: v.status,
          blockedRanges: v.blocks.map((b: any) => ({
            start: b.start,
            end: b.end,
            startTime: b.startTime || "",
            endTime: b.endTime || "",
            reason: b.reason,
          })),
        })),
        fleetAvailabilityContext,
        systemInstructionContext: `IMPORTANT: Use the following real-time fleet availability data to guide your responses. If a customer requests a car that is blocked or rented on their selected dates, excuse yourself politely, explain that the car is unavailable for those specific dates, and recommend another available car from the list.\n\nReal-time Fleet Availability Data:\n${fleetAvailabilityContext}`
      };
    } catch (e) {
      console.error('Failed to enrich chat webhook with fleet context:', e);
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichedBody),
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
        sessionId: body.userId || body.sessionId,
        startedAt: body.startedAt || new Date().toISOString(),
        country: body.metadata?.language || '', 
        metadata: body.metadata || {},
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
