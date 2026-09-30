"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Heart, MapPin, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_LABELS, CONDITION_LABELS, ITEMS_PER_PAGE } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";

interface AnnouncementPhoto {
  url: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  availability: string;
  city: string | null;
  state: string | null;
  status: string;
  createdAt: string;
  donor: {
    id: string;
    name: string;
  };
  photos: AnnouncementPhoto[];
  _count?: {
    favorites: number;
  };
  isFavorited?: boolean;
}

interface ApiResponse {
  announcements: AnnouncementItem[];
  total: number;
  page: number;
  totalPages: number;
}

const CATEGORIES = [
  { key: "TODOS", label: "Todos" },
  ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({ key, label })),
];

const CONDITIONS = [
  { key: "", label: "Qualquer condicao" },
  ...Object.entries(CONDITION_LABELS).map(([key, label]) => ({ key, label })),
];

const AVAILABILITY_OPTIONS = [
  { key: "", label: "Qualquer disponibilidade" },
  { key: "RETIRADA", label: "Retirada no local" },
  { key: "ENTREGA", label: "Entrega pelo doador" },
  { key: "AMBAS", label: "Ambas" },
];

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const currentPage = Number(searchParams.get("page") || "1");
  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "TODOS";
  const condition = searchParams.get("condition") || "";
  const availability = searchParams.get("availability") || "";

  const [searchInput, setSearchInput] = useState(search);

  const buildQueryString = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();
      const merged = {
        page: String(currentPage),
        q: search,
        category: category,
        condition: condition,
        availability: availability,
        ...overrides,
      };
      Object.entries(merged).forEach(([key, value]) => {
        if (value && value !== "TODOS" && key !== "page" || (key === "page" && value !== "1")) {
          params.set(key, value);
        }
      });
      const qs = params.toString();
      return qs ? `?${qs}` : "";
    },
    [currentPage, search, category, condition, availability]
  );

  const navigateTo = useCallback(
    (overrides: Record<string, string>) => {
      router.push(`/feed${buildQueryString(overrides)}`);
    },
    [router, buildQueryString]
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchAnnouncements() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (category && category !== "TODOS") params.set("category", category);
        if (condition) params.set("condition", condition);
        if (availability) params.set("availability", availability);
        params.set("page", String(currentPage));
        params.set("limit", String(ITEMS_PER_PAGE));

        const res = await fetch(`/api/announcements?${params.toString()}`);
        if (!res.ok) throw new Error("Erro ao carregar anúncios");
        const data: ApiResponse = await res.json();
        if (!cancelled) {
          setAnnouncements(data.announcements || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAnnouncements();
    return () => {
      cancelled = true;
    };
  }, [search, category, condition, availability, currentPage]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigateTo({ q: searchInput, page: "1" });
  }

  async function toggleFavorite(e: React.MouseEvent, announcementId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId }),
      });
      if (res.ok) {
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === announcementId
              ? { ...a, isFavorited: !a.isFavorited }
              : a
          )
        );
      }
    } catch {
      // silent fail
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Itens disponíveis</h1>
        <p className="mt-1 text-sm text-gray-500">
          Encontre itens que as pessoas estão doando perto de você
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nome, categoria ou localização..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </form>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() =>
              navigateTo({
                category: cat.key,
                page: "1",
              })
            }
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat.key || (cat.key === "TODOS" && category === "TODOS")
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={condition}
          onChange={(e) => navigateTo({ condition: e.target.value, page: "1" })}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {CONDITIONS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={availability}
          onChange={(e) =>
            navigateTo({ availability: e.target.value, page: "1" })
          }
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {AVAILABILITY_OPTIONS.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
        </select>
        {total > 0 && (
          <span className="flex items-center text-sm text-gray-500">
            {total} {total === 1 ? "resultado" : "resultados"}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <div className="aspect-[4/3] w-full animate-pulse rounded-t-xl bg-gray-200" />
              <CardContent className="space-y-3 pt-4">
                <div className="flex gap-2">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
                </div>
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                <div className="flex justify-between">
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-medium text-red-600 underline hover:text-red-800"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && announcements.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <span className="text-4xl">📦</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Nenhum anúncio encontrado
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Tente ajustar seus filtros ou busca para encontrar mais itens.
          </p>
        </div>
      )}

      {/* Announcements grid */}
      {!loading && !error && announcements.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <a
              key={announcement.id}
              href={`/anuncio/${announcement.id}`}
              className="group block"
            >
              <Card hover>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gray-100">
                  {announcement.photos && announcement.photos.length > 0 ? (
                    <img
                      src={announcement.photos[0].url}
                      alt={announcement.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => toggleFavorite(e, announcement.id)}
                    className={`absolute top-3 right-3 rounded-full p-2 transition-colors ${
                      announcement.isFavorited
                        ? "bg-red-50 text-red-500"
                        : "bg-white/80 text-gray-400 hover:text-red-500"
                    }`}
                    aria-label="Favoritar"
                  >
                    <Heart
                      size={18}
                      fill={announcement.isFavorited ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <CardContent className="space-y-2 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getConditionVariant(announcement.condition)}>
                      {CONDITION_LABELS[announcement.condition] || announcement.condition}
                    </Badge>
                    <Badge variant="outline">
                      {CATEGORY_LABELS[announcement.category] || announcement.category}
                    </Badge>
                  </div>
                  <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
                    {announcement.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    {(announcement.city || announcement.state) && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        {[announcement.city, announcement.state]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(announcement.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => navigateTo({ page: String(currentPage - 1) })}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span className="px-3 text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => navigateTo({ page: String(currentPage + 1) })}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próximo
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
