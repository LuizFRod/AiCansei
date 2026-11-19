import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sendSchema = z.object({
  announcementId: z.string().min(1),
  recipientId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, "Mensagem vazia")
    .max(2000, "Mensagem muito longa"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const me = session.user.id;

    const announcementId = request.nextUrl.searchParams.get("announcementId");
    const otherUser = request.nextUrl.searchParams.get("userId");

    if (announcementId && otherUser) {
      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        select: { id: true, title: true, status: true, donorId: true },
      });

      if (!announcement) {
        return NextResponse.json(
          { error: "Anúncio não encontrado." },
          { status: 404 }
        );
      }

      const thread = await prisma.message.findMany({
        where: {
          announcementId,
          OR: [
            { senderId: me, recipientId: otherUser },
            { senderId: otherUser, recipientId: me },
          ],
        },
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, photo: true } },
        },
      });

      await prisma.message.updateMany({
        where: {
          announcementId,
          senderId: otherUser,
          recipientId: me,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({ messages: thread, announcement });
    }

    const mine = await prisma.message.findMany({
      where: { OR: [{ senderId: me }, { recipientId: me }] },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, photo: true } },
        recipient: { select: { id: true, name: true, photo: true } },
        announcement: {
          select: {
            id: true,
            title: true,
            photos: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
    });

    const conversations = new Map<
      string,
      {
        announcementId: string;
        announcementTitle: string;
        announcementPhoto: string | null;
        otherUser: { id: string; name: string; photo: string | null };
        lastMessage: string;
        lastAt: Date;
        unread: number;
      }
    >();

    for (const m of mine) {
      const key = `${m.announcementId}|${m.senderId === me ? m.recipientId : m.sender.id}`;
      if (conversations.has(key)) {
        const c = conversations.get(key)!;
        if (m.recipientId === me && !m.read) c.unread++;
        continue;
      }
      const other =
        m.senderId === me
          ? m.recipient
          : m.sender;
      conversations.set(key, {
        announcementId: m.announcementId,
        announcementTitle: m.announcement.title,
        announcementPhoto: m.announcement.photos[0]?.url || null,
        otherUser: other,
        lastMessage: m.content,
        lastAt: m.createdAt,
        unread: m.recipientId === me && !m.read ? 1 : 0,
      });
    }

    return NextResponse.json(
      Array.from(conversations.values()).sort(
        (a, b) => b.lastAt.getTime() - a.lastAt.getTime()
      )
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

async function isRelatedTo(userId: string, announcementId: string) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    select: { donorId: true, recipientId: true },
  });

  if (!announcement) return false;

  if (
    announcement.donorId === userId ||
    announcement.recipientId === userId
  ) {
    return true;
  }

  const manifestation = await prisma.manifestation.findUnique({
    where: {
      userId_announcementId: { userId, announcementId },
    },
    select: { id: true },
  });

  return Boolean(manifestation);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = sendSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const { announcementId, recipientId, content } = result.data;
    const me = session.user.id;

    if (recipientId === me) {
      return NextResponse.json(
        { error: "Você não pode enviar mensagem para si mesmo." },
        { status: 400 }
      );
    }

    const [senderAllowed, recipientAllowed] = await Promise.all([
      isRelatedTo(me, announcementId),
      isRelatedTo(recipientId, announcementId),
    ]);

    if (!senderAllowed || !recipientAllowed) {
      return NextResponse.json(
        { error: "Vocês não têm vínculo com este anúncio." },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        announcementId,
        senderId: me,
        recipientId,
      },
      include: { announcement: { select: { title: true } } },
    });

    await prisma.notification.create({
      data: {
        title: "💬 Nova mensagem",
        message: `${session.user.name} te enviou uma mensagem sobre "${message.announcement.title}".`,
        type: "MENSAGEM",
        userId: recipientId,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
