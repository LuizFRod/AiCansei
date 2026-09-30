import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId e obrigatorio." },
        { status: 400 }
      );
    }

    const [reviews, aggregate] = await Promise.all([
      prisma.review.findMany({
        where: { reviewedId: userId },
        include: {
          reviewer: {
            select: { id: true, name: true, photo: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.aggregate({
        where: { reviewedId: userId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return NextResponse.json({
      reviews,
      averageRating: aggregate._avg.rating || 0,
      totalReviews: aggregate._count.rating,
    });
  } catch (error) {
    console.error("Error listing reviews:", error);
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
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Dados invalidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { rating, comment, reviewedId, donationId } = result.data;

    if (reviewedId === session.user.id) {
      return NextResponse.json(
        { error: "Voce nao pode avaliar a si mesmo." },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: session.user.id,
        reviewedId,
        donationId: donationId || null,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Voce ja avaliou este usuario para esta doacao." },
        { status: 400 }
      );
    }

    const reviewedUser = await prisma.user.findUnique({
      where: { id: reviewedId },
      select: { id: true },
    });

    if (!reviewedUser) {
      return NextResponse.json(
        { error: "Usuario nao encontrado." },
        { status: 404 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || null,
        reviewerId: session.user.id,
        reviewedId,
        donationId: donationId || null,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, photo: true },
        },
      },
    });

    const aggregate = await prisma.review.aggregate({
      where: { reviewedId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.user.update({
      where: { id: reviewedId },
      data: {
        reputation: aggregate._avg.rating || 0,
        reviewCount: aggregate._count.rating,
      },
    });

    await prisma.notification.create({
      data: {
        title: "Nova avaliacao recebida",
        message: `Voce recebeu uma avaliacao de ${rating} estrela(s).`,
        type: "AVALIACAO",
        userId: reviewedId,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
