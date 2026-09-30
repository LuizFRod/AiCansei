"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Package, Plus, MapPin, Loader2, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CATEGORY_LABELS, CONDITION_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";

interface MyAnnouncement {
  id: string;
  title: string;
  category: string;
  condition: string;
  status: string;
  city: string | null;
  state: string | null;
  createdAt: string;
  photos: { url: string }[];
  _count: { manifestations: number };
}

export default function MeusAnunciosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<MyAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.id) {
      fetch(`/api/announcements?donorId=${session.user.id}&limit=100`)
        .then((res) => res.json())
        .then((data) => setAnnouncements(data.announcements || []))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  async function deleteAnnouncement(id: string) {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // silent
    }
  }

  function getStatusVariant(status: string) {
    switch (status) {
      case "ATIVO": return "success" as const;
      case "PENDENTE": return "warning" as const;
      case "DOADO": return "info" as const;
      case "REJEITADO": return "danger" as const;
      default: return "default" as const;
    }
  }

  function getConditionVariant(condition: string) {
    switch (condition) {
      case "NOVO": return "success" as const;
      case "OTIMO": return "info" as const;
      case "BOM": return "default" as const;
      case "REGULAR": return "warning" as const;
      default: return "default" as const;
    }
  }

  const filtered = filter === "ALL"
    ? announcements
    : announcements.filter((a) => a.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Anúncios</h1>
          <p className="mt-1 text-sm text-gray-500">{announcements.length} anúncios publicados</p>
        </div>
        <Button onClick={() => router.push("/anuncio/novo")}>
          <Plus size={16} /> Novo anúncio
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["ALL", "PENDENTE", "ATIVO", "DOADO", "REJEITADO"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f === "ALL" ? "Todos" : STATUS_LABELS[f] || f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
          <Package size={32} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            {filter === "ALL" ? "Nenhum anúncio ainda" : "Nenhum anúncio com este status"}
          </p>
          {filter === "ALL" && (
            <button
              onClick={() => router.push("/anuncio/novo")}
              className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-800"
            >
              Criar primeiro anúncio
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ann) => (
            <Card key={ann.id}>
              <CardContent className="flex items-center gap-4 pt-5">
                {ann.photos.length > 0 ? (
                  <img
                    src={ann.photos[0].url}
                    alt={ann.title}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                    <Package size={20} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-gray-900">{ann.title}</h3>
                    <Badge variant={getStatusVariant(ann.status)}>
                      {STATUS_LABELS[ann.status] || ann.status}
                    </Badge>
                    <Badge variant={getConditionVariant(ann.condition)}>
                      {CONDITION_LABELS[ann.condition]}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span>{CATEGORY_LABELS[ann.category]}</span>
                    {ann.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />{ann.city}{ann.state && `, ${ann.state}`}
                      </span>
                    )}
                    <span>{ann._count.manifestations} interessados</span>
                    <span>{formatRelativeTime(ann.createdAt)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  <a
                    href={`/anuncio/${ann.id}`}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Eye size={16} />
                  </a>
                  <a
                    href={`/anuncio/${ann.id}/editar`}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                  >
                    <Edit size={16} />
                  </a>
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
