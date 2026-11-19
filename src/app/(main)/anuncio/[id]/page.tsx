"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Heart,
  MapPin,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  AVAILABILITY_LABELS,
} from "@/lib/constants";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface Photo {
  id: string;
  url: string;
  sortOrder: number;
}

interface Donor {
  id: string;
  name: string;
  photo: string | null;
  reputation: number;
  reviewCount: number;
  createdAt: string;
  _count?: {
    announcements: number;
  };
}

interface Manifestation {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    photo: string | null;
    reputation: number;
  };
}

interface AnnouncementDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  availability: string;
  city: string | null;
  state: string | null;
  address: string | null;
  status: string;
  createdAt: string;
  donor: Donor;
  photos: Photo[];
  manifestations: Manifestation[];
  isFavorited: boolean;
  hasManifested: boolean;
}

export default function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [manifesting, setManifesting] = useState(false);
  const [message, setMessage] = useState("");
  const [showManifestModal, setShowManifestModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatSent, setChatSent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchAnnouncement() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/announcements/${id}`);
        if (!res.ok) throw new Error("Anúncio não encontrado");
        const data = await res.json();
        if (!cancelled) setAnnouncement(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Erro ao carregar anúncio"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAnnouncement();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleFavorite() {
    if (!session) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: id }),
      });
      if (res.ok && announcement) {
        setAnnouncement({
          ...announcement,
          isFavorited: !announcement.isFavorited,
        });
      }
    } catch {
      // silent
    }
  }

  async function handleManifest() {
    if (!session) {
      router.push("/login");
      return;
    }
    setManifesting(true);
    try {
      const res = await fetch("/api/manifestations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementId: id,
          message: message || undefined,
        }),
      });
      if (res.ok && announcement) {
        setAnnouncement({
          ...announcement,
          hasManifested: true,
        });
        setShowManifestModal(false);
        setMessage("");
      }
    } catch {
      // silent
    } finally {
      setManifesting(false);
    }
  }

  async function handleManifestationAction(
    manifestationId: string,
    action: "ACEITA" | "RECUSADA"
  ) {
    setActionLoading(manifestationId);
    try {
      const res = await fetch(`/api/manifestations/${manifestationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok && announcement) {
        setAnnouncement({
          ...announcement,
          manifestations: announcement.manifestations.map((m) =>
            m.id === manifestationId ? { ...m, status: action } : m
          ),
        });
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  function getConditionVariant(condition: string) {
    switch (condition) {
      case "NOVO":
        return "success" as const;
      case "OTIMO":
        return "info" as const;
      case "BOM":
        return "default" as const;
      case "REGULAR":
        return "warning" as const;
      default:
        return "default" as const;
    }
  }

  function getManifestationStatusVariant(status: string) {
    switch (status) {
      case "PENDENTE":
        return "warning" as const;
      case "ACEITA":
        return "success" as const;
      case "RECUSADA":
        return "danger" as const;
      case "CONCLUIDA":
        return "info" as const;
      default:
        return "default" as const;
    }
  }

  const isDonor =
    session?.user?.id && announcement?.donor?.id
      ? session.user.id === announcement.donor.id
      : false;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-gray-200" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-20 animate-pulse rounded-lg bg-gray-200"
                />
              ))}
            </div>
          </div>
          <div className="space-y-4 lg:col-span-2">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-4xl">😢</span>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          {error || "Anúncio não encontrado"}
        </h2>
        <button
          onClick={() => router.push("/feed")}
          className="mt-4 text-sm font-medium text-emerald-600 underline hover:text-emerald-800"
        >
          Voltar ao feed
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft size={16} />
        Voltar
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left: Photos */}
        <div className="space-y-3 lg:col-span-3">
          {/* Main photo */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
            {announcement.photos.length > 0 ? (
              <>
                <img
                  src={announcement.photos[activePhotoIndex].url}
                  alt={announcement.title}
                  className="h-full w-full object-cover"
                />
                {announcement.photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev > 0 ? prev - 1 : announcement.photos.length - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow-sm transition-colors hover:bg-white"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev < announcement.photos.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow-sm transition-colors hover:bg-white"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                      {activePhotoIndex + 1} / {announcement.photos.length}
                    </span>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300">
                <Package size={64} />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {announcement.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {announcement.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setActivePhotoIndex(index)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    index === activePhotoIndex
                      ? "border-emerald-500"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={`Foto ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="space-y-5 lg:col-span-2">
          {/* Title and badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getConditionVariant(announcement.condition)}>
                {CONDITION_LABELS[announcement.condition]}
              </Badge>
              <Badge variant="outline">
                {CATEGORY_LABELS[announcement.category]}
              </Badge>
              <Badge variant="default">
                {AVAILABILITY_LABELS[announcement.availability]}
              </Badge>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">
              {announcement.title}
            </h1>
          </div>

          {/* Location */}
          {(announcement.city || announcement.state) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} className="text-gray-400" />
              <span>
                {[announcement.address, announcement.city, announcement.state]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} className="text-gray-400" />
            <span>Publicado em {formatDate(announcement.createdAt)}</span>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              Descricao
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {announcement.description}
            </p>
          </div>

          {/* Donor card */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                  {announcement.donor.photo ? (
                    <img
                      src={announcement.donor.photo}
                      alt={announcement.donor.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    announcement.donor.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <a
                    href={`/usuario/${announcement.donor.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-emerald-700"
                  >
                    {announcement.donor.name}
                  </a>
                  <div className="flex items-center gap-2">
                    <StarRating
                      value={announcement.donor.reputation}
                      size="sm"
                    />
                    <span className="text-xs text-gray-500">
                      ({announcement.donor.reviewCount}{" "}
                      {announcement.donor.reviewCount === 1
                        ? "avaliação"
                        : "avaliações"})
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Membro desde{" "}
                  {new Date(announcement.donor.createdAt).getFullYear()}
                </span>
                {announcement.donor._count && (
                  <span className="flex items-center gap-1">
                    <Package size={12} />
                    {announcement.donor._count.announcements} anúncios
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Favorite button */}
            <button
              onClick={handleFavorite}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-colors ${
                announcement.isFavorited
                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:text-red-500"
              }`}
            >
              <Heart
                size={18}
                fill={announcement.isFavorited ? "currentColor" : "none"}
              />
              {announcement.isFavorited ? "Remover dos Favoritos" : "Favoritar"}
            </button>

            {/* "Quero Esse Item" button */}
            {!isDonor && !announcement.hasManifested && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setShowManifestModal(true)}
              >
                Quero Esse Item!
              </Button>
            )}

            {announcement.hasManifested && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-medium text-emerald-700">
                <CheckCircle size={18} />
                Ja manifestou interesse neste item
              </div>
            )}

            {/* Falar com o doador */}
            {session && !isDonor && announcement.status === "ATIVO" && (
              <div className="space-y-2">
                {!chatOpen ? (
                  <button
                    onClick={() => setChatOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    <MessageSquare size={18} />
                    Falar com o doador
                  </button>
                ) : (
                  <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-3">
                    {chatSent ? (
                      <p className="py-2 text-center text-sm text-emerald-700">
                        Mensagem enviada! 💚{" "}
                        <a href="/mensagens" className="font-semibold underline">
                          Abrir conversas
                        </a>
                      </p>
                    ) : (
                      <>
                        <textarea
                          value={chatText}
                          onChange={(e) => setChatText(e.target.value)}
                          placeholder={`Oi! Ainda está disponível?`}
                          rows={3}
                          maxLength={2000}
                          className="w-full resize-none rounded-lg border border-gray-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={!chatText.trim() || chatSending}
                            onClick={async () => {
                              setChatSending(true);
                              try {
                                const res = await fetch("/api/messages", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    announcementId: id,
                                    recipientId: announcement.donor.id,
                                    content: chatText.trim(),
                                  }),
                                });
                                if (res.ok) {
                                  setChatSent(true);
                                } else {
                                  const data = await res.json();
                                  alert(data.error || "Erro ao enviar mensagem");
                                }
                              } catch {
                                alert("Erro ao enviar mensagem");
                              } finally {
                                setChatSending(false);
                              }
                            }}
                          >
                            {chatSending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              "Enviar"
                            )}
                          </Button>
                          <button
                            onClick={() => setChatOpen(false)}
                            className="rounded-lg px-3 text-sm text-gray-500 hover:text-gray-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {isDonor && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 py-3 text-center text-sm font-medium text-blue-700">
                Este anúncio e seu
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manifestations list (only for donor) */}
      {isDonor && announcement.manifestations.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Pessoas interessadas ({announcement.manifestations.length})
          </h2>
          <div className="space-y-3">
            {announcement.manifestations.map((manifestation) => (
              <Card key={manifestation.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                        {manifestation.user.photo ? (
                          <img
                            src={manifestation.user.photo}
                            alt={manifestation.user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          manifestation.user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <a
                          href={`/usuario/${manifestation.user.id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-emerald-700"
                        >
                          {manifestation.user.name}
                        </a>
                        <div className="flex items-center gap-2">
                          <StarRating
                            value={manifestation.user.reputation}
                            size="sm"
                          />
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(manifestation.createdAt)}
                          </span>
                        </div>
                        {manifestation.message && (
                          <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-600">
                            <MessageSquare
                              size={14}
                              className="mt-0.5 shrink-0 text-gray-400"
                            />
                            {manifestation.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={getManifestationStatusVariant(
                        manifestation.status
                      )}
                    >
                      {manifestation.status === "PENDENTE"
                        ? "Pendente"
                        : manifestation.status === "ACEITA"
                          ? "Aceita"
                          : manifestation.status === "RECUSADA"
                            ? "Recusada"
                            : "Concluida"}
                    </Badge>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                    <a
                      href={`/mensagens?a=${announcement.id}&u=${manifestation.user.id}`}
                      className="flex items-center gap-1.5 rounded-lg border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                      <MessageSquare size={14} />
                      Conversar
                    </a>
                    {manifestation.status === "PENDENTE" && (
                      <Button
                        size="sm"
                        variant="primary"
                        loading={actionLoading === manifestation.id}
                        onClick={() =>
                          handleManifestationAction(
                            manifestation.id,
                            "ACEITA"
                          )
                        }
                      >
                        Doar para esta pessoa
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Manifest modal */}
      {showManifestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Manifestar interesse
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Sua mensagem vai direto para o chat com o doador 💬
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ola! Tenho interesse no item. (opcional)"
              rows={3}
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowManifestModal(false);
                  setMessage("");
                }}
              >
                Cancelar
              </Button>
              <Button
                loading={manifesting}
                onClick={handleManifest}
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
