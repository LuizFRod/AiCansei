import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { reviewSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório." },
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
      const message = result.error.issues[0]?.message || "Dados inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { rating, comment, reviewedId, donationId } = result.data;

    if (reviewedId === session.user.id) {
      return NextResponse.json(
        { error: "Você não pode avaliar a si mesmo." },
        { status: 400 }
      );
    }

    if (!rateLimit(`review:${session.user.id}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Muitas avaliações em sequência. Aguarde um instante." },
        { status: 429 }
      );
    }

    const donationLink = await prisma.announcement.findFirst({
      where: {
        status: "DOADO",
        OR: [
          { donorId: session.user.id, recipientId: reviewedId },
          { donorId: reviewedId, recipientId: session.user.id },
        ],
      },
      select: { id: true },
    });

    if (!donationLink) {
      return NextResponse.json(
        { error: "Você só pode avaliar usuários com quem concluiu uma doação." },
        { status: 403 }
      );
    }

    if (donationId) {
      const linkedDonation = await prisma.announcement.findFirst({
        where: {
          id: donationId,
          OR: [
            { donorId: session.user.id, recipientId: reviewedId },
            { donorId: reviewedId, recipientId: session.user.id },
          ],
        },
        select: { id: true },
      });

      if (!linkedDonation) {
        return NextResponse.json(
          { error: "Doação inválida para esta avaliação." },
          { status: 403 }
        );
      }
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
        { error: "Você já avaliou este usuário para esta doação." },
        { status: 400 }
      );
    }

    const reviewedUser = await prisma.user.findUnique({
      where: { id: reviewedId },
      select: { id: true },
    });

    if (!reviewedUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
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
        title: "Nova avaliação recebida",
        message: `Você recebeu uma avaliação de ${rating} estrela(s).`,
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
