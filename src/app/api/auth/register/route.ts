import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod/v4"
import { prisma } from "@/lib/prisma"
import { rateLimit, clientIp } from "@/lib/rate-limit"

const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo"),
  email: z.email("Email inválido"),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha muito longa"),
})

export async function POST(request: Request) {
  try {
    if (!rateLimit(`register:${clientIp(request)}`, 10, 3_600_000)) {
      return NextResponse.json(
        { error: "Muitas tentativas de cadastro. Tente novamente mais tarde." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Dados inválidos"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { name, email, password } = result.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado." },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "RECEPTOR",
      },
    })

    return NextResponse.json(
      { message: "Conta criada com sucesso." },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    )
  }
}
