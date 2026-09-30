import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const city = searchParams.get("city");
    const search = searchParams.get("search") || searchParams.get("q");
    const availability = searchParams.get("availability");
    const status = searchParams.get("status");
    const donorId = searchParams.get("donorId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    } else if (!donorId) {
      // Public feed only shows active announcements
      where.status = "ATIVO";
    }

    if (category) where.category = category;
    if (condition) where.condition = condition;
    if (city) where.city = city;
    if (availability) where.availability = availability;
    if (donorId) where.donorId = donorId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const session = await auth();

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          photos: { orderBy: { sortOrder: "asc" } },
          donor: {
            select: { name: true, photo: true, reputation: true },
          },
          _count: {
            select: { manifestations: true, favorites: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.announcement.count({ where }),
    ]);

    // Check which announcements the current user has favorited
    let favoritedIds = new Set<string>();
    if (session?.user?.id && announcements.length > 0) {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: session.user.id,
          announcementId: { in: announcements.map((a) => a.id) },
        },
        select: { announcementId: true },
      });
      favoritedIds = new Set(favorites.map((f) => f.announcementId));
    }

    const announcementsWithFav = announcements.map((a) => ({
      ...a,
      isFavorited: favoritedIds.has(a.id),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ announcements: announcementsWithFav, total, page, totalPages });
  } catch (error) {
    console.error("Error listing announcements:", error);
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
    const result = announcementSchema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Dados inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { title, description, category, condition, availability, city, state, address, latitude, longitude } = result.data;

    const announcement = await prisma.announcement.create({
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
        status: "PENDENTE",
        donorId: session.user.id,
        photos: {
          create: (body.photos as Array<{ url: string; sortOrder?: number }> || []).map((photo, index) => ({
            url: photo.url,
            sortOrder: photo.sortOrder ?? index,
          })),
        },
      },
      include: {
        photos: { orderBy: { sortOrder: "asc" } },
        donor: {
          select: { id: true, name: true, photo: true, reputation: true },
        },
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
