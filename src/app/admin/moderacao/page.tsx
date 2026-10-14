"use client";

import { useState, useEffect } from "react";
import {
  Check,
  X,
  Eye,
  Image as ImageIcon,
  Loader2,
  Clock,
  Package,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/constants";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface PendingAnnouncement {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  city: string | null;
  state: string | null;
  createdAt: string;
  donor: {
    id: string;
    name: string;
    email: string;
  };
  photos: { id: string; url: string }[];
}

export default function ModerationPage() {
  const [announcements, setAnnouncements] = useState<PendingAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPending() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "/api/announcements?status=PENDENTE&limit=100"
        );
        if (!res.ok) throw new Error("Erro ao carregar anúncios pendentes");
        const data = await res.json();
        if (!cancelled) {
          setAnnouncements(data.announcements || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar anúncios pendentes"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPending();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleApprove(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/announcements/${id}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ATIVO" }),
      });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // silent
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/announcements/${id}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJEITADO",
          reason: rejectReason || undefined,
        }),
      });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setShowRejectModal(null);
        setRejectReason("");
      }
    } catch {
      // silent
    } finally {
      setProcessingId(null);
    }
  }

  function openRejectModal(id: string) {
    setShowRejectModal(id);
    setRejectReason("");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <div className="flex gap-4">
                  <div className="h-24 w-32 animate-pulse rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-64 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={40} className="text-red-400" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">{error}</h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm font-medium text-emerald-600 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Moderação de Anúncios
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {announcements.length} {announcements.length === 1 ? "anúncio pendente" : "anúncios pendentes"}
        </p>
      </div>

      {/* Empty state */}
      {!loading && announcements.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <span className="text-4xl">✅</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Tudo em dia!
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Nenhum anúncio pendente de moderação no momento.
          </p>
        </div>
      )}

      {/* Pending announcements list */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardContent className="py-5">
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Photos */}
                <div className="shrink-0">
                  {announcement.photos && announcement.photos.length > 0 ? (
                    <div className="flex gap-2">
                      <img
                        src={announcement.photos[0].url}
                        alt={announcement.title}
                        className="h-24 w-32 rounded-lg object-cover"
                      />
                      {announcement.photos.length > 1 && (
                        <div className="flex h-24 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-500">
                          +{announcement.photos.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-24 w-32 items-center justify-center rounded-lg bg-gray-100">
                      <ImageIcon size={24} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    <Badge variant="warning">Pendente</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {CATEGORY_LABELS[announcement.category]}
                    </Badge>
                    <Badge variant="outline">
                      {CONDITION_LABELS[announcement.condition]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Doador: {announcement.donor.name} ({announcement.donor.email})
                  </p>
                  {(announcement.city || announcement.state) && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      Localizacao: {[announcement.city, announcement.state]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    Publicado {formatRelativeTime(announcement.createdAt)}
                  </p>

                  {/* Expand description */}
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === announcement.id
                          ? null
                          : announcement.id
                      )
                    }
                    className="mt-2 text-xs font-medium text-emerald-600 hover:text-emerald-800"
                  >
                    {expandedId === announcement.id
                      ? "Ocultar descrição"
                      : "Ver descrição"}
                  </button>
                  {expandedId === announcement.id && (
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                      {announcement.description}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <Button
                    size="sm"
                    variant="primary"
                    loading={processingId === announcement.id}
                    onClick={() => handleApprove(announcement.id)}
                  >
                    <Check size={14} />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={processingId === announcement.id}
                    onClick={() => openRejectModal(announcement.id)}
                  >
                    <X size={14} />
                    Rejeitar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      window.open(`/anuncio/${announcement.id}`, "_blank")
                    }
                  >
                    <Eye size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Rejeitar anúncio
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Informe o motivo da rejeição (opcional)
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Foto ilegivel, descrição incompleta, item não condiz..."
              rows={3}
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                loading={processingId === showRejectModal}
                onClick={() => handleReject(showRejectModal)}
              >
                Rejeitar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
