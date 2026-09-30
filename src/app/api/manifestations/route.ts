import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { manifestationSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const announcementId = searchParams.get("announcementId");

    if (announcementId) {
      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        select: { donorId: true },
      });

      if (!announcement) {
        return NextResponse.json(
          { error: "Anuncio nao encontrado." },
          { status: 404 }
        );
      }

      if (announcement.donorId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const manifestations = await prisma.manifestation.findMany({
        where: { announcementId },
        include: {
          announcement: {
            select: { title: true, photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
          },
          user: {
            select: { id: true, name: true, photo: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(manifestations);
    }

    const manifestations = await prisma.manifestation.findMany({
      where: { userId: session.user.id },
      include: {
        announcement: {
          select: {
            title: true,
            photos: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
        user: {
          select: { id: true, name: true, photo: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(manifestations);
  } catch (error) {
    console.error("Error listing manifestations:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = manifestationSchema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Dados invalidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { announcementId, message } = result.data;

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { id: true, donorId: true, title: true, status: true },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Anuncio nao encontrado." },
        { status: 404 }
      );
    }

    if (announcement.status !== "ATIVO") {
      return NextResponse.json(
        { error: "Anuncio nao esta disponivel." },
        { status: 400 }
      );
    }

    if (announcement.donorId === session.user.id) {
      return NextResponse.json(
        { error: "Voce nao pode manifestar interesse no proprio anuncio." },
        { status: 400 }
      );
    }

    const existingManifestation = await prisma.manifestation.findUnique({
      where: {
        userId_announcementId: {
          userId: session.user.id,
          announcementId,
        },
      },
    });

    if (existingManifestation) {
      return NextResponse.json(
        { error: "Voce ja manifestou interesse neste anuncio." },
        { status: 400 }
      );
    }

    const manifestation = await prisma.manifestation.create({
      data: {
        message: message || null,
        userId: session.user.id,
        announcementId,
      },
      include: {
        announcement: {
          select: { title: true, photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
        },
        user: {
          select: { id: true, name: true, photo: true },
        },
      },
    });

    await prisma.notification.create({
      data: {
        title: "Novo interesse no seu anuncio",
        message: `${session.user.name || "Alguem"} manifestou interesse no seu anuncio "${announcement.title}".`,
        type: "INTERESSE",
        userId: announcement.donorId,
      },
    });

    return NextResponse.json(manifestation, { status: 201 });
  } catch (error) {
    console.error("Error creating manifestation:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
