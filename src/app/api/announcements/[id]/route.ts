import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { sortOrder: "asc" } },
        donor: {
          select: {
            id: true,
            name: true,
            photo: true,
            reputation: true,
            city: true,
            state: true,
          },
        },
        manifestations: {
          include: {
            user: {
              select: { id: true, name: true, photo: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { favorites: true },
        },
      },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Anuncio nao encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const result = announcementSchema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Dados invalidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { title, description, category, condition, availability, city, state, address, latitude, longitude } = result.data;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        description,
        category,
        condition,
        availability,
        city,
        state,
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
      },
      include: {
        photos: { orderBy: { sortOrder: "asc" } },
        donor: {
          select: { id: true, name: true, photo: true, reputation: true },
        },
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const isAdmin = session.user.role === "ADMIN";
    if (existing.donorId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.announcement.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
