import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        announcement: {
          include: {
            photos: { orderBy: { sortOrder: "asc" }, take: 1 },
            donor: {
              select: { id: true, name: true, photo: true, reputation: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error listing favorites:", error);
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
    const { announcementId } = body;

    if (!announcementId) {
      return NextResponse.json(
        { error: "announcementId e obrigatorio." },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { id: true },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Anuncio nao encontrado." },
        { status: 404 }
      );
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_announcementId: {
          userId: session.user.id,
          announcementId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });

      const count = await prisma.favorite.count({
        where: { announcementId },
      });

      return NextResponse.json({ favorited: false, count });
    }

    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        announcementId,
      },
    });

    const count = await prisma.favorite.count({
      where: { announcementId },
    });

    return NextResponse.json({ favorited: true, count });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
