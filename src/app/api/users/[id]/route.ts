import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        photo: true,
        city: true,
        state: true,
        reputation: true,
        reviewCount: true,
        createdAt: true,
        _count: {
          select: { announcements: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const reviewsReceived = await prisma.review.findMany({
      where: { reviewedId: id },
      include: {
        reviewer: {
          select: { id: true, name: true, photo: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ...user,
      reviewsReceived,
    });
  } catch (error) {
    console.error("Error fetching public user profile:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
