import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "crypto";

const RAW_SECRET = process.env.NEXTAUTH_SECRET;
if (!RAW_SECRET || RAW_SECRET.length < 16) {
  throw new Error("NEXTAUTH_SECRET é obrigatório e deve ter pelo menos 16 caracteres.");
}
const SECRET = createHash("sha256").update(RAW_SECRET).digest();

const TTL_MS = 10 * 60 * 1000;

type Challenge = { a: number; b: number; op: "+" | "-"; exp: number };

const consumedTokens = new Set<string>();
let lastSweep = Date.now();

function sweepConsumed() {
  if (Date.now() - lastSweep < TTL_MS) return;
  lastSweep = Date.now();
  consumedTokens.clear();
}

function encrypt(payload: object): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", SECRET, iv);
  const enc = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64url"),
    enc.toString("base64url"),
    tag.toString("base64url"),
  ].join(".");
}

function decrypt(token: string): Challenge | null {
  try {
    const [ivB, dataB, tagB] = token.split(".");
    if (!ivB || !dataB || !tagB) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      SECRET,
      Buffer.from(ivB, "base64url")
    );
    decipher.setAuthTag(Buffer.from(tagB, "base64url"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(dataB, "base64url")),
      decipher.final(),
    ]);
    return JSON.parse(dec.toString()) as Challenge;
  } catch {
    return null;
  }
}

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

  return {
    question: `${challenge.a} ${challenge.op} ${challenge.b} = ?`,
    token: encrypt(challenge),
  };
}

export function verifyChallenge(token: unknown, answer: unknown): boolean {
  if (
    typeof token !== "string" ||
    (typeof answer !== "string" && typeof answer !== "number")
  ) {
    return false;
  }

  sweepConsumed();

  if (consumedTokens.has(token)) {
    return false;
  }

  const data = decrypt(token);
  if (!data) return false;

  if (Date.now() > data.exp) return false;

  const result = data.op === "+" ? data.a + data.b : data.a - data.b;
  const given = Number(answer);

  if (!Number.isFinite(given)) return false;

  if (given !== result) return false;

  consumedTokens.add(token);
  return true;
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
