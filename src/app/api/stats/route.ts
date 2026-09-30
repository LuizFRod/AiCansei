import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [totalUsers, totalAnnouncements, totalDonations, activeAnnouncements, pendingModeration] =
      await Promise.all([
        prisma.user.count(),
        prisma.announcement.count(),
        prisma.announcement.count({ where: { status: "DOADO" } }),
        prisma.announcement.count({ where: { status: "ATIVO" } }),
        prisma.announcement.count({ where: { status: "PENDENTE" } }),
      ]);

    return NextResponse.json({
      totalUsers,
      totalAnnouncements,
      totalDonations,
      activeAnnouncements,
      pendingModeration,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
