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
    
    // Map camelCase fields back to the exact database column headers specified by the user:
    // Lead ID, Date Captured, Full Name, Phone Number, Email Address, Vehicle Interest, Rental Dates, Contact Made, Call Outcome, User Sentiment, Still Interested, Follow-up Scheduled, Do Not Call, Conversation Summary, Call Transcript, Call Summary (AI), Lead Source, Call Recording URL, Call Duration
    const mappedBody = {
      ...body,
      "Lead ID": body.leadId || body.id,
      "Date Captured": body.dateCaptured,
      "Full Name": body.fullName,
      "Phone Number": body.phoneNumber,
      "Email Address": body.emailAddress,
      "Vehicle Interest": body.vehicleInterest,
      "Rental Dates": body.rentalDates,
      "Contact Made": body.contactMade === true || body.contactMade === "true" || body.contactMade === "Yes" ? "Yes" : "No",
      "Call Outcome": body.callOutcome,
      "User Sentiment": body.userSentiment,
      "Still Interested": body.stillInterested === true || body.stillInterested === "true" || body.stillInterested === "Yes" ? "Yes" : "No",
      "Follow-up Scheduled": body.followUpScheduled,
      "Do Not Call": body.doNotCall === true || body.doNotCall === "true" || body.doNotCall === "Yes" ? "Yes" : "No",
      "Conversation Summary": body.conversationSummary,
      "Call Transcript": body.callTranscript,
      "Call Summary (AI)": body.callSummaryAi,
      "Lead Source": body.leadSource,
      "Call Recording URL": body.callRecordingUrl,
      "Call Duration": body.callDurationSec,
    };

    const response = await fetch(EDIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mappedBody),
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
    const mappedBody = {
      ...body,
      "Lead ID": body.leadId || body.id,
    };

    const response = await fetch(DELETE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mappedBody),
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
