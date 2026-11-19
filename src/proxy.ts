import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimit, clientIp } from "@/lib/rate-limit"

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  )
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )
  if (!response.headers.has("Content-Security-Policy")) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
    response.headers.set("Content-Security-Policy", csp)
  }
  return response
}

function blockedResponse(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Serviço disponível apenas no Brasil." },
      { status: 403 }
    )
  }
  return new NextResponse(
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>AiCansei</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb"><div style="text-align:center;padding:2rem"><h1 style="color:#059669">🌱 AiCansei</h1><p style="color:#374151">Este serviço está disponível apenas no Brasil.</p></div></body></html>`,
    { status: 403, headers: { "content-type": "text/html; charset=utf-8" } }
  )
}
// Routes that require authentication
const protectedRoutes = [
  "/feed",
  "/anuncio",
  "/meus-anuncios",
  "/favoritos",
  "/perfil",
  "/usuario",
  "/notificacoes",
]

// Routes that require ADMIN role
const adminRoutes = ["/admin"]

// API routes that don't require authentication
const publicApiRoutes = [
  "/api/auth",
  "/api/contact",
  "/api/captcha",
  "/api/locations",
]

// Endpoints sensíveis a flood (cadastro, contato, recuperação de senha)
const strictLimitPaths = [
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/contact",
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const country = request.headers.get("x-vercel-ip-country")
  if (country && country !== "BR") {
    return blockedResponse(request)
  }

  const ip = clientIp(request)

  // Limite geral para toda a API (GET incluso): 120 req/min por IP
  if (
    pathname.startsWith("/api/") &&
    !rateLimit(`api:${ip}`, 120, 60_000)
  ) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429 }
    )
  }

  // Limite reforçado em endpoints públicos sensíveis: 10 req/min por IP
  if (
    strictLimitPaths.some((p) => pathname.startsWith(p)) &&
    !rateLimit(`strict:${ip}`, 10, 60_000)
  ) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429 }
    )
  }

  // Consultas externas (IBGE/ViaCEP) têm cache no servidor: 30 req/min
  if (pathname.startsWith("/api/locations")) {
    if (!rateLimit(`loc:${ip}`, 30, 60_000)) {
      return NextResponse.json(
        { error: "Muitas consultas. Aguarde um instante." },
        { status: 429 }
      )
    }
    return withSecurityHeaders(NextResponse.next())
  }

  // Allow public API routes
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return withSecurityHeaders(NextResponse.next())
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return withSecurityHeaders(NextResponse.next())
  }

  // All other API routes require authentication
  if (pathname.startsWith("/api/")) {
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) &&
      !rateLimit(`api:${clientIp(request)}`, 60, 60_000)
    ) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em instantes." },
        { status: 429 }
      )
    }

    // Public read access to the announcements feed (GET only)
    const isPublicFeed =
      request.method === "GET" &&
      (pathname === "/api/announcements" ||
        /^\/api\/announcements\/[^/]+$/.test(pathname))
    if (isPublicFeed) {
      return withSecurityHeaders(NextResponse.next())
    }

    const session = await auth()
    if (!session?.user) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
      )
    }
    return withSecurityHeaders(NextResponse.next())
  }

  // Public auth pages are always accessible
  if (pathname.startsWith("/login") || pathname.startsWith("/cadastro")) {
    // Logged-in users go straight to the feed instead of registering again
    if (pathname.startsWith("/cadastro")) {
      const session = await auth()
      if (session?.user) {
        return NextResponse.redirect(new URL("/feed", request.url))
      }
    }
    return withSecurityHeaders(NextResponse.next())
  }

  // Home page is public
  if (pathname === "/") {
    return withSecurityHeaders(NextResponse.next())
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute || isAdminRoute) {
    const session = await auth()

    if (!session?.user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Admin routes require ADMIN role
    if (isAdminRoute && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/feed", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
}
