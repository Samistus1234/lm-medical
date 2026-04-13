import { NextResponse } from "next/server";
import { sendQuoteNotification } from "@/lib/whatsapp";

export async function GET() {
  // Test send
  try {
    const result = await sendQuoteNotification({
      quoteNumber: "LM-Q-TEST-DEBUG",
      contactName: "Debug Test",
      organization: "Test Org",
      email: "test@test.com",
      itemCount: 1,
    });

    return NextResponse.json({
      envVars: {
        WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID ? "SET (" + process.env.WHATSAPP_PHONE_ID.substring(0, 6) + "...)" : "MISSING",
        WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN ? "SET (" + process.env.WHATSAPP_API_TOKEN.substring(0, 10) + "...)" : "MISSING",
        WHATSAPP_TEAM_NUMBER: process.env.WHATSAPP_TEAM_NUMBER || "MISSING",
      },
      sendResult: result,
      message: result ? "WhatsApp sent successfully!" : "WhatsApp send FAILED - check server logs",
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
