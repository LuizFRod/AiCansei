"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  MapPin,
  Package,
  Star,
  Calendar,
  ChevronLeft,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { CATEGORY_LABELS, CONDITION_LABELS, ROLE_LABELS } from "@/lib/constants";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  city: string | null;
  state: string | null;
  role: string;
  reputation: number;
  reviewCount: number;
  createdAt: string;
  _count?: {
    announcements: number;
    receivedReviews: number;
  };
  recentAnnouncements?: {
    id: string;
    title: string;
    category: string;
    condition: string;
    status: string;
    city: string | null;
    state: string | null;
    createdAt: string;
    photos: { url: string }[];
  }[];
  recentReviews?: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    reviewer: {
      name: string;
      photo: string | null;
    };
  }[];
}

function getRoleVariant(role: string) {
  switch (role) {
    case "ADMIN":
      return "danger" as const;
    case "DOADOR":
      return "success" as const;
    default:
      return "default" as const;
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

function getStatusVariant(status: string) {
  switch (status) {
    case "ATIVO":
      return "success" as const;
    case "PENDENTE":
      return "warning" as const;
    case "DOADO":
      return "info" as const;
    default:
      return "default" as const;
  }
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error("Usuário não encontrado");
        const data = await res.json();
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Erro ao carregar perfil"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-56 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <div className="mx-auto h-20 w-full animate-pulse rounded bg-gray-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-4xl">😢</span>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          {error || "Usuário não encontrado"}
        </h2>
        <button
          onClick={() => router.push("/feed")}
          className="mt-4 text-sm font-medium text-emerald-600 underline"
        >
          Voltar ao feed
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft size={16} />
        Voltar
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={profile.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            profile.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
          <Badge variant={getRoleVariant(profile.role)} className="mt-1">
            {ROLE_LABELS[profile.role] || profile.role}
          </Badge>
          {(profile.city || profile.state) && (
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={14} />
              {[profile.city, profile.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center py-5">
            <StarRating value={profile.reputation} size="md" />
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {profile.reputation.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Reputacao</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Package size={20} className="text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {profile._count?.announcements ?? 0}
            </p>
            <p className="text-xs text-gray-500">Anúncios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Star size={20} className="text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {profile._count?.receivedReviews ?? profile.reviewCount ?? 0}
            </p>
            <p className="text-xs text-gray-500">Avaliações</p>
          </CardContent>
        </Card>
      </div>

      {/* Member since */}
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            Membro desde {formatDate(profile.createdAt)}
          </span>
        </CardContent>
      </Card>

      {/* User's announcements */}
      {profile.recentAnnouncements && profile.recentAnnouncements.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">
              Anúncios deste usuário
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {profile.recentAnnouncements.map((ann) => (
                <a
                  key={ann.id}
                  href={`/anuncio/${ann.id}`}
                  className="group flex gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {ann.photos && ann.photos.length > 0 ? (
                      <img
                        src={ann.photos[0].url}
                        alt={ann.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <Package size={20} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-gray-900 group-hover:text-emerald-700">
                      {ann.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant={getStatusVariant(ann.status)} className="text-[10px]">
                        {ann.status === "ATIVO"
                          ? "Ativo"
                          : ann.status === "PENDENTE"
                            ? "Pendente"
                            : ann.status === "DOADO"
                              ? "Doado"
                              : ann.status}
                      </Badge>
                      <Badge variant={getConditionVariant(ann.condition)} className="text-[10px]">
                        {CONDITION_LABELS[ann.condition]}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={10} />
                      {formatRelativeTime(ann.createdAt)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews received */}
      {profile.recentReviews && profile.recentReviews.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">
              Avaliações recebidas
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {review.reviewer.photo ? (
                        <img
                          src={review.reviewer.photo}
                          alt={review.reviewer.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        review.reviewer.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {review.reviewer.name}
                      </p>
                      <StarRating value={review.rating} size="sm" />
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-gray-600">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
