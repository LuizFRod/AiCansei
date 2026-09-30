import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { donorId: true },
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

    const photoCount = await prisma.photo.count({
      where: { announcementId: id },
    });

    if (photoCount >= 5) {
      return NextResponse.json(
        { error: "Maximo de 5 fotos por anuncio." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { url, sortOrder } = body;

    if (!url) {
      return NextResponse.json(
        { error: "url e obrigatoria." },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.create({
      data: {
        url,
        sortOrder: sortOrder ?? photoCount,
        announcementId: id,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Error adding photo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json(
        { error: "photoId e obrigatorio." },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { announcement: { select: { donorId: true } } },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Foto nao encontrada." },
        { status: 404 }
      );
    }

    if (photo.announcement.donorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.photo.delete({ where: { id: photoId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error removing photo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
