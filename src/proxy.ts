import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

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
const publicApiRoutes = ["/api/auth", "/api/upload"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public API routes
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // All other API routes require authentication
  if (pathname.startsWith("/api/")) {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Autenticação necessária." },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // Public auth pages are always accessible
  if (pathname.startsWith("/login") || pathname.startsWith("/cadastro")) {
    return NextResponse.next()
  }

  // Home page is public
  if (pathname === "/") {
    return NextResponse.next()
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
