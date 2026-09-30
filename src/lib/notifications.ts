import { prisma } from "./prisma";
import { NotificationType } from "@prisma/client";

export async function createNotification({
  userId,
  title,
  message,
  type = NotificationType.SISTEMA,
}: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}) {
  return prisma.notification.create({
    data: { userId, title, message, type },
  });
}

export async function notifyNewInterest({
  donorId,
  recipientName,
  announcementTitle,
}: {
  donorId: string;
  recipientName: string;
  announcementTitle: string;
}) {
  return createNotification({
    userId: donorId,
    title: "Novo interesse!",
    message: `${recipientName} manifestou interesse no seu anúncio '${announcementTitle}'`,
    type: NotificationType.INTERESSE,
  });
}

export async function notifyDonationApproved({
  donorId,
  announcementTitle,
}: {
  donorId: string;
  announcementTitle: string;
}) {
  return createNotification({
    userId: donorId,
    title: "Anúncio aprovado!",
    message: `Seu anúncio '${announcementTitle}' foi aprovado e está visível na plataforma`,
    type: NotificationType.MODERACAO,
  });
}

export async function notifyDonationRejected({
  donorId,
  announcementTitle,
  reason,
}: {
  donorId: string;
  announcementTitle: string;
  reason?: string;
}) {
  return createNotification({
    userId: donorId,
    title: "Anúncio rejeitado",
    message: `Seu anúncio '${announcementTitle}' foi rejeitado.${reason ? ` Motivo: ${reason}` : ""}`,
    type: NotificationType.MODERACAO,
  });
}

export async function notifyDonationCompleted({
  recipientId,
  donorName,
  announcementTitle,
}: {
  recipientId: string;
  donorName: string;
  announcementTitle: string;
}) {
  return createNotification({
    userId: recipientId,
    title: "Doação confirmada!",
    message: `${donorName} confirmou a doação de '${announcementTitle}' para você! Avalie a experiência.`,
    type: NotificationType.SISTEMA,
  });
}

export async function notifyReviewReceived({
  userId,
  reviewerName,
  rating,
}: {
  userId: string;
  reviewerName: string;
  rating: number;
}) {
  return createNotification({
    userId,
    title: "Avaliação recebida",
    message: `${reviewerName} deixou uma avaliação de ${rating} estrela${rating > 1 ? "s" : ""} para você!`,
    type: NotificationType.AVALIACAO,
  });
}
