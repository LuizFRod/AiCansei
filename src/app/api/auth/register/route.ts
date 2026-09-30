import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod/v4"
import { prisma } from "@/lib/prisma"

const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Nome e obrigatorio")
    .max(100, "Nome muito longo"),
  email: z.email("Email invalido"),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha muito longa"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Dados invalidos"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { name, email, password } = result.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ja esta cadastrado." },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

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
