import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  recipientId: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { recipientId } = result.data;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true, title: true, donorId: true, status: true },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Anúncio não encontrado." },
        { status: 404 }
      );
    }

    if (announcement.donorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (announcement.status !== "ATIVO") {
      return NextResponse.json(
        { error: "Este anúncio não está mais ativo." },
        { status: 400 }
      );
    }

    const manifestation = await prisma.manifestation.findUnique({
      where: {
        userId_announcementId: {
          userId: recipientId,
          announcementId: id,
        },
      },
      select: { id: true },
    });

    if (!manifestation) {
      return NextResponse.json(
        { error: "Esta pessoa não manifestou interesse neste anúncio." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.manifestation.update({
        where: { id: manifestation.id },
        data: { status: "ACEITA" },
      }),
      prisma.manifestation.updateMany({
        where: {
          announcementId: id,
          id: { not: manifestation.id },
        },
        data: { status: "RECUSADA" },
      }),
      prisma.announcement.update({
        where: { id },
        data: { status: "DOADO", recipientId },
      }),
    ]);

    await prisma.notification.create({
      data: {
        title: "Parabens! Você foi escolhido! 🎉",
        message: `O doador escolheu você para receber "${announcement.title}". Combine os detalhes pelo chat.`,
        type: "SISTEMA",
        userId: recipientId,
      },
    });

    return NextResponse.json({ success: true, status: "DOADO", recipientId });
  } catch (error) {
    console.error("Error donating announcement:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
