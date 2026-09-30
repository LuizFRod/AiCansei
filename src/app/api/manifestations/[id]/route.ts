import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const manifestation = await prisma.manifestation.findUnique({
      where: { id },
      include: {
        announcement: {
          select: { id: true, donorId: true, title: true },
        },
      },
    });

    if (!manifestation) {
      return NextResponse.json(
        { error: "Manifestacao nao encontrada." },
        { status: 404 }
      );
    }

    if (manifestation.announcement.donorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (status !== "ACEITA" && status !== "RECUSADA") {
      return NextResponse.json(
        { error: "Status deve ser ACEITA ou RECUSADA." },
        { status: 400 }
      );
    }

    const updated = await prisma.manifestation.update({
      where: { id },
      data: { status },
      include: {
        announcement: {
          select: { title: true },
        },
        user: {
          select: { id: true, name: true, photo: true },
        },
      },
    });

    if (status === "ACEITA") {
      await prisma.announcement.update({
        where: { id: manifestation.announcement.id },
        data: {
          status: "DOADO",
          recipientId: manifestation.userId,
        },
      });

      await prisma.manifestation.updateMany({
        where: {
          announcementId: manifestation.announcement.id,
          id: { not: id },
        },
        data: { status: "RECUSADA" },
      });
    }

    const notificationTitle =
      status === "ACEITA"
        ? "Sua manifestacao foi aceita!"
        : "Sua manifestacao foi recusada";

    const notificationMessage =
      status === "ACEITA"
        ? `Parabens! Sua manifestacao para "${manifestation.announcement.title}" foi aceita. Entre em contato com o doador.`
        : `Sua manifestacao para "${manifestation.announcement.title}" foi recusada.`;

    await prisma.notification.create({
      data: {
        title: notificationTitle,
        message: notificationMessage,
        type: "SISTEMA",
        userId: manifestation.userId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating manifestation:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
