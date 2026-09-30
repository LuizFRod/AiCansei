"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Package,
  Heart,
  Shield,
  ArrowRight,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  totalAnnouncements: number;
  totalDonations: number;
  pendingModeration: number;
}

interface RecentAnnouncement {
  id: string;
  title: string;
  status: string;
  category: string;
  createdAt: string;
  donor: {
    name: string;
  };
}

function getStatusVariant(status: string) {
  switch (status) {
    case "ATIVO":
      return "success" as const;
    case "PENDENTE":
      return "warning" as const;
    case "DOADO":
      return "info" as const;
    case "REJEITADO":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<RecentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/announcements?limit=10&sort=recent"),
        ]);

        if (!statsRes.ok || !recentRes.ok) {
          throw new Error("Erro ao carregar dados do admin");
        }

        const statsData = await statsRes.json();
        const recentData = await recentRes.json();

        if (!cancelled) {
          setStats(statsData);
          setRecent(recentData.announcements || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Erro ao carregar dados"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <div className="h-20 w-full animate-pulse rounded bg-gray-100" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="py-5">
            <div className="h-64 w-full animate-pulse rounded bg-gray-100" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-4xl">😢</span>
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

  const statCards = [
    {
      label: "Total de Usuarios",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      href: "/admin/usuarios",
    },
    {
      label: "Total de Anuncios",
      value: stats?.totalAnnouncements ?? 0,
      icon: Package,
      color: "bg-emerald-100 text-emerald-600",
      href: "/admin/moderacao",
    },
    {
      label: "Doacoes Concluidas",
      value: stats?.totalDonations ?? 0,
      icon: Heart,
      color: "bg-rose-100 text-rose-600",
      href: "/admin",
    },
    {
      label: "Pendente Moderacao",
      value: stats?.pendingModeration ?? 0,
      icon: Shield,
      color: "bg-amber-100 text-amber-600",
      href: "/admin/moderacao",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Painel Administrativo
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Visao geral da plataforma AiCansei
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover>
              <CardContent className="flex items-center gap-4 py-5">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/admin/moderacao">
          <Card hover>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <Shield size={24} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Moderar Anuncios
                </h3>
                <p className="text-xs text-gray-500">
                  Aprove ou reprove anuncios pendentes
                </p>
              </div>
              <ArrowRight size={18} className="text-gray-400" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/usuarios">
          <Card hover>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <Users size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Gerenciar Usuarios
                </h3>
                <p className="text-xs text-gray-500">
                  Visualize e gerencie os usuarios da plataforma
                </p>
              </div>
              <ArrowRight size={18} className="text-gray-400" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Anuncios Recentes
            </h2>
            <Link
              href="/admin/moderacao"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
            >
              Ver todos
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Nenhum anuncio encontrado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Titulo
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Doador
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Categoria
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Status
                    </th>
                    <th className="pb-3 font-medium text-gray-500">
                      Publicado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((ann) => (
                    <tr
                      key={ann.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/anuncio/${ann.id}`}
                          className="font-medium text-gray-900 hover:text-emerald-700"
                        >
                          {ann.title.length > 40
                            ? ann.title.slice(0, 40) + "..."
                            : ann.title}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {ann.donor.name}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline">
                          {CATEGORY_LABELS[ann.category] || ann.category}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={getStatusVariant(ann.status)}>
                          {STATUS_LABELS[ann.status]}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500">
                        {formatRelativeTime(ann.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
