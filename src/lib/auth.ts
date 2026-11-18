import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const loginAttempts = new Map<
  string,
  { count: number; lockedUntil: number }
>()
const MAX_LOGIN_ATTEMPTS = 7
const LOGIN_LOCK_MS = 5 * 60 * 1000

function registerFailedLogin(email: string) {
  if (loginAttempts.size > 5000) {
    const now = Date.now()
    for (const [key, value] of loginAttempts) {
      if (value.lockedUntil < now) loginAttempts.delete(key)
    }
  }

  const key = email.toLowerCase()
  const attempt = loginAttempts.get(key)
  const count = (attempt?.count ?? 0) + 1

  if (count >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.set(key, { count: 0, lockedUntil: Date.now() + LOGIN_LOCK_MS })
  } else {
    loginAttempts.set(key, { count, lockedUntil: 0 })
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({


  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const emailKey = String(credentials.email).toLowerCase()
        const attempt = loginAttempts.get(emailKey)

        if (attempt && attempt.lockedUntil > Date.now()) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          registerFailedLogin(emailKey)
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          registerFailedLogin(emailKey)
          return null
        }

        loginAttempts.delete(emailKey)

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.photo,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role?: string }).role ?? "RECEPTOR"
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl

      // Public auth pages don't need protection
      if (pathname.startsWith("/login") || pathname.startsWith("/cadastro")) {
        return true
      }

      // Allow NextAuth API routes
      if (pathname.startsWith("/api/auth")) {
        return true
      }

      // Public pages
      if (
        pathname === "/" ||
        pathname === "/sobre" ||
        pathname === "/contato" ||
        pathname === "/termos"
      ) {
        return true
      }

      // All other routes require authentication
      return !!auth?.user
    },
  },
})
