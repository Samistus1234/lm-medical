import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID ? "SET (" + process.env.WHATSAPP_PHONE_ID.substring(0, 6) + "...)" : "MISSING",
    WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN ? "SET (" + process.env.WHATSAPP_API_TOKEN.substring(0, 10) + "...)" : "MISSING",
    WHATSAPP_TEAM_NUMBER: process.env.WHATSAPP_TEAM_NUMBER ? "SET (" + process.env.WHATSAPP_TEAM_NUMBER + ")" : "MISSING",
    SMTP_USER: process.env.SMTP_USER ? "SET" : "MISSING",
    SMTP_PASS: process.env.SMTP_PASS ? "SET" : "MISSING",
  });
}
