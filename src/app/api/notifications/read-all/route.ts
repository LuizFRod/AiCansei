import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ count: result.count });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
