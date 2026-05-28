import { NextRequest, NextResponse } from "next/server";

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN!;
const VERIFY_SID  = process.env.TWILIO_VERIFY_SID!;

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number required" }, { status: 400 });
    }

    const credentials = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");

    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${VERIFY_SID}/Verifications`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: phone, Channel: "whatsapp" }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("[whatsapp/send] Twilio error:", data);
      return NextResponse.json(
        { success: false, error: data.message ?? "Failed to send OTP" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, status: data.status });
  } catch (err) {
    console.error("[whatsapp/send]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
