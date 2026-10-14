"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";

interface FavoriteAnnouncement {
  id: string;
  title: string;
  category: string;
  condition: string;
  city: string | null;
  state: string | null;
  createdAt: string;
  photos: { url: string }[];
  donor: { name: string };
}

export default function FavoritosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/favorites")
        .then((res) => res.json())
        .then((data) => {
          // API returns favorites array with nested announcement data
          const favs: FavoriteAnnouncement[] = Array.isArray(data)
            ? data.map((f: { announcement: FavoriteAnnouncement }) => f.announcement as FavoriteAnnouncement)
            : [];
          setFavorites(favs);
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  async function removeFavorite(id: string) {
    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: id }),
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
      }
    } catch {
      // silent
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Favoritos</h1>
        <p className="mt-1 text-sm text-gray-500">Itens que você salvou para depois</p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
          <Heart size={32} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">Nenhum favorito ainda</p>
          <button
            onClick={() => router.push("/feed")}
            className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-800"
          >
            Explorar itens
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <div key={fav.id} className="group relative">
              <a href={`/anuncio/${fav.id}`} className="block">
                <Card hover>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gray-100">
                    {fav.photos.length > 0 ? (
                      <img
                        src={fav.photos[0].url}
                        alt={fav.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <span className="text-4xl">📷</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="space-y-2 pt-4">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={getConditionVariant(fav.condition)}>
                        {CONDITION_LABELS[fav.condition]}
                      </Badge>
                      <Badge variant="outline">{CATEGORY_LABELS[fav.category]}</Badge>
                    </div>
                    <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
                      {fav.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      {(fav.city || fav.state) && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {[fav.city, fav.state].filter(Boolean).join(", ")}
                        </span>
                      )}
                      <span>{formatRelativeTime(fav.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </a>
              <button
                onClick={(e) => { e.preventDefault(); removeFavorite(fav.id); }}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-red-500 shadow-sm transition-colors hover:bg-red-50"
                title="Remover dos favoritos"
              >
                <Heart size={16} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
