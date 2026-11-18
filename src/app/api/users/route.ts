import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z
      .string()
      .min(8, "A nova senha deve ter pelo menos 8 caracteres")
      .max(100, "Senha muito longa")
      .regex(/[A-Za-z]/, "A nova senha deve conter pelo menos uma letra")
      .regex(/[0-9]/, "A nova senha deve conter pelo menos um número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        photo: true,
        role: true,
        reputation: true,
        reviewCount: true,
        latitude: true,
        longitude: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Dados inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, phone, address, city, state, photo } = result.data;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        photo: photo || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        photo: true,
        role: true,
        reputation: true,
        reviewCount: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Dados inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Sua sessão expirou ou é inválida. Faça login novamente." },
        { status: 401 }
      );
    }

    if (user.password) {
      const currentValid = await bcrypt.compare(
        result.data.currentPassword,
        user.password
      );

      if (!currentValid) {
        return NextResponse.json(
          { error: "Senha atual incorreta." },
          { status: 400 }
        );
      }

      const samePassword = await bcrypt.compare(
        result.data.newPassword,
        user.password
      );

      if (samePassword) {
        return NextResponse.json(
          { error: "A nova senha deve ser diferente da atual." },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(result.data.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
