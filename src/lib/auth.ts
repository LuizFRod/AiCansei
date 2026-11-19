import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const MAX_LOGIN_ATTEMPTS = 7
const LOGIN_LOCK_MS = 5 * 60 * 1000

const unknownEmailAttempts = new Map<
  string,
  { count: number; lockedUntil: number }
>()

function registerUnknownEmailFailure(emailKey: string) {
  if (unknownEmailAttempts.size > 5000) {
    const now = Date.now()
    for (const [key, value] of unknownEmailAttempts) {
      if (value.lockedUntil < now && value.count === 0) {
        unknownEmailAttempts.delete(key)
      }
    }
  }

  const attempt = unknownEmailAttempts.get(emailKey)
  const count = (attempt?.count ?? 0) + 1

  if (count >= MAX_LOGIN_ATTEMPTS) {
    unknownEmailAttempts.set(emailKey, {
      count: 0,
      lockedUntil: Date.now() + LOGIN_LOCK_MS,
    })
  } else {
    unknownEmailAttempts.set(emailKey, { count, lockedUntil: 0 })
  }
}

async function registerFailedLoginForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLogins: true },
  })

  if (!user) return

  const failedLogins = user.failedLogins + 1

  await prisma.user.update({
    where: { id: userId },
    data:
      failedLogins >= MAX_LOGIN_ATTEMPTS
        ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOGIN_LOCK_MS) }
        : { failedLogins },
  })
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

        const emailKey = String(credentials.email).trim().toLowerCase()

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (
          user?.lockedUntil &&
          user.lockedUntil.getTime() > Date.now()
        ) {
          return null
        }

        const unknownAttempt = unknownEmailAttempts.get(emailKey)
        if (!user && unknownAttempt && unknownAttempt.lockedUntil > Date.now()) {
          return null
        }

        if (!user || !user.password) {
          registerUnknownEmailFailure(emailKey)
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          await registerFailedLoginForUser(user.id)
          return null
        }

        if (user.failedLogins > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLogins: 0 },
          })
        }
        unknownEmailAttempts.delete(emailKey)

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
