import { handlers } from "@/lib/auth"
import type { NextRequest } from "next/server"
import { rateLimit, clientIp } from "@/lib/rate-limit"

export const GET = handlers.GET

export async function POST(request: NextRequest) {
  if (!rateLimit(`login:${clientIp(request)}`, 10, 60_000)) {
    return Response.json(
      { error: "Muitas tentativas de login. Aguarde um minuto e tente novamente." },
      { status: 429 }
    )
  }

  return handlers.POST(request)
}
