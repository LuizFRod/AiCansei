import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderationSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true, donorId: true, title: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Anuncio nao encontrado." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = moderationSchema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Dados invalidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { status, reason } = result.data;

    const updated = await prisma.announcement.update({
      where: { id },
      data: { status },
    });

    const notificationTitle =
      status === "ATIVO"
        ? "Anuncio aprovado"
        : "Anuncio rejeitado";

    const notificationMessage =
      status === "ATIVO"
        ? `Seu anuncio "${existing.title}" foi aprovado e esta ativo.`
        : `Seu anuncio "${existing.title}" foi rejeitado.${reason ? ` Motivo: ${reason}` : ""}`;

    await prisma.notification.create({
      data: {
        title: notificationTitle,
        message: notificationMessage,
        type: "MODERACAO",
        userId: existing.donorId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error moderating announcement:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
