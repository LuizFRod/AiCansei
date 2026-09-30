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

    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { donorId: true, title: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Anuncio nao encontrado." },
        { status: 404 }
      );
    }

    if (existing.donorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { recipientId } = body;

    if (!recipientId) {
      return NextResponse.json(
        { error: "recipientId e obrigatorio." },
        { status: 400 }
      );
    }

    const validManifestation = await prisma.manifestation.findFirst({
      where: {
        announcementId: id,
        userId: recipientId,
      },
    });

    if (!validManifestation) {
      return NextResponse.json(
        { error: "RecipientId nao e uma manifestacao valida para este anuncio." },
        { status: 400 }
      );
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        status: "DOADO",
        recipientId,
        manifestations: {
          updateMany: {
            where: {
              announcementId: id,
              userId: { not: recipientId },
            },
            data: { status: "RECUSADA" },
          },
        },
      },
      include: {
        photos: { orderBy: { sortOrder: "asc" } },
        donor: {
          select: { id: true, name: true, photo: true, reputation: true },
        },
      },
    });

    await prisma.notification.create({
      data: {
        title: "Parabens! Voce foi selecionado",
        message: `Voce foi selecionado para receber o item "${existing.title}". Entre em contato com o doador.`,
        type: "SISTEMA",
        userId: recipientId,
      },
    });

    const unselectedManifestations = await prisma.manifestation.findMany({
      where: {
        announcementId: id,
        userId: { not: recipientId },
      },
      select: { userId: true },
    });

    if (unselectedManifestations.length > 0) {
      await prisma.notification.createMany({
        data: unselectedManifestations.map((m) => ({
          title: "Anuncio doado",
          message: `O item "${existing.title}" foi doado para outro interessado.`,
          type: "SISTEMA",
          userId: m.userId,
        })),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error donating announcement:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
