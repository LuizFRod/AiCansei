import { NextRequest, NextResponse } from "next/server";
import { generateChallenge, verificationMode } from "@/lib/captcha";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  if (!rateLimit(`captcha:${clientIp(request)}`, 30, 60_000)) {
    return NextResponse.json(
      { error: "Muitas solicitações. Aguarde um instante." },
      { status: 429 }
    );
  }

  if (verificationMode() === "turnstile") {
    return NextResponse.json({
      mode: "turnstile",
      siteKey: process.env.TURNSTILE_SITE_KEY,
    });
  }

  return NextResponse.json({ mode: "math", ...generateChallenge() });
}
