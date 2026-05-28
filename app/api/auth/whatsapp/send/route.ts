import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const ACCOUNT_SID    = process.env.TWILIO_ACCOUNT_SID!;
const AUTH_TOKEN     = process.env.TWILIO_AUTH_TOKEN!;
const HMAC_SECRET    = process.env.OTP_HMAC_SECRET ?? "warsha-otp-default-secret-change-me";
const WHATSAPP_FROM  = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number required" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 10-minute time window
    const windowTs = Math.floor(Date.now() / 600000).toString();

    // HMAC-SHA256 sign {phone}:{otp}:{windowTs}
    const otpToken = createHmac("sha256", HMAC_SECRET)
      .update(`${phone}:${otp}:${windowTs}`)
      .digest("base64");

    // Send via Twilio WhatsApp Messages API
    const credentials = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: WHATSAPP_FROM,
          To:   `whatsapp:${phone}`,
          Body: `Your Warsha+ verification code is: *${otp}*\n\nExpires in 10 minutes. Do not share it.`,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("[whatsapp/send] Twilio error:", data);
      return NextResponse.json(
        { success: false, error: data.message ?? "Failed to send WhatsApp message" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, otp_token: otpToken });
  } catch (err) {
    console.error("[whatsapp/send]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
