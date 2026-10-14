"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Package,
  Heart,
  Star,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  announcementId?: string;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "NEW_MANIFESTATION":
      return <MessageSquare size={18} className="text-blue-500" />;
    case "MANIFESTATION_ACCEPTED":
      return <Check size={18} className="text-green-500" />;
    case "MANIFESTATION_REJECTED":
      return <BellOff size={18} className="text-red-500" />;
    case "DONATION_COMPLETED":
      return <Package size={18} className="text-emerald-500" />;
    case "NEW_FAVORITE":
      return <Heart size={18} className="text-red-500" />;
    case "NEW_REVIEW":
      return <Star size={18} className="text-amber-500" />;
    default:
      return <Bell size={18} className="text-gray-500" />;
  }
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Agora";
  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  return date.toLocaleDateString("pt-BR");
}

export default function NotificacoesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          setNotifications(Array.isArray(data) ? data : []);
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silent
    }
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} não ${unreadCount === 1 ? "lida" : "lidas"}`
              : "Tudo lido"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            <CheckCheck size={16} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
          <Bell size={32} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">Nenhuma notificação</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              hover={!!notif.announcementId}
              className={`transition-colors ${
                !notif.read ? "border-emerald-100 bg-emerald-50/30" : ""
              }`}
            >
              <CardContent className="flex items-start gap-3 pt-4">
                <div className="mt-0.5 shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-sm ${
                        !notif.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                      }`}
                    >
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Marcar como lida"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{notif.message}</p>
                  <span className="mt-1 block text-xs text-gray-400">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
