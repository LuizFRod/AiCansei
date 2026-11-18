import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod/v4";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(10, "Token inválido"),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha muito longa")
    .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
});

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(`reset:${clientIp(request)}`, 10, 3_600_000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256")
      .update(result.data.token)
      .digest("hex");

    const reset = await prisma.passwordReset.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, active: true } } },
    });

    if (
      !reset ||
      reset.usedAt ||
      reset.expiresAt < new Date() ||
      !reset.user.active
    ) {
      return NextResponse.json(
        { error: "Link inválido ou expirado. Solicite um novo." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
