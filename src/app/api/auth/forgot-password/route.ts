import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendEmail, emailConfigured, passwordResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.email("Email inválido"),
});

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(`forgot:${clientIp(request)}`, 5, 3_600_000)) {
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

    const email = result.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    const genericMessage =
      "Se este email estiver cadastrado, você receberá um link para redefinir a senha.";

    if (!user || !user.active) {
      return NextResponse.json({ message: genericMessage });
    }

    await prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await prisma.passwordReset.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    const origin =
      process.env.NEXTAUTH_URL ||
      request.nextUrl.origin ||
      "https://aicansei.vercel.app";
    const resetUrl = `${origin}/redefinir-senha?token=${token}`;

    const template = passwordResetEmail(user.name, resetUrl);

    const { delivered } = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    const response: {
      message: string;
      resetUrl?: string;
    } = { message: genericMessage };

    if (!delivered && !emailConfigured()) {
      response.resetUrl = resetUrl;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
