import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "aicansai-captcha-fallback";
const TTL_MS = 10 * 60 * 1000;

type Challenge = { a: number; b: number; op: "+" | "-"; exp: number };

export function generateChallenge(): { question: string; token: string } {
  const a = 3 + Math.floor(Math.random() * 8);
  const b = 1 + Math.floor(Math.random() * 9);
  const subtract = Math.random() < 0.4;

  const challenge: Challenge = {
    a: subtract ? Math.max(a, b) + Math.floor(Math.random() * 5) : a,
    b,
    op: subtract ? "-" : "+",
    exp: Date.now() + TTL_MS,
  };

  const payload = Buffer.from(JSON.stringify(challenge)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");

  return {
    question: `${challenge.a} ${challenge.op} ${challenge.b} = ?`,
    token: `${payload}.${sig}`,
  };
}

export function verifyChallenge(token: unknown, answer: unknown): boolean {
  if (
    typeof token !== "string" ||
    (typeof answer !== "string" && typeof answer !== "number")
  ) {
    return false;
  }

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    ) as Challenge;

    if (Date.now() > data.exp) return false;

    const result = data.op === "+" ? data.a + data.b : data.a - data.b;
    return Number(answer) === result;
  } catch {
    return false;
  }
}

export function verificationMode(): "turnstile" | "math" {
  return process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY
    ? "turnstile"
    : "math";
}

export async function verifyHuman(params: {
  turnstileToken?: unknown;
  captchaToken?: unknown;
  captchaAnswer?: unknown;
}): Promise<boolean> {
  if (verificationMode() === "turnstile") {
    const { turnstileToken } = params;
    if (typeof turnstileToken !== "string" || !turnstileToken) return false;

    try {
      const res = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
          }),
        }
      );
      const data = (await res.json()) as { success?: boolean };
      return Boolean(data.success);
    } catch {
      return false;
    }
  }

  return verifyChallenge(params.captchaToken, params.captchaAnswer);
}
