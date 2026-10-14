"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Users,
  Package,
  Star,
  Calendar,
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string | null;
  state: string | null;
  reputation: number;
  reviewCount: number;
  createdAt: string;
  active: boolean;
  _count?: {
    announcements: number;
  };
}

interface ApiResponse {
  users: UserItem[];
  total: number;
  page: number;
  totalPages: number;
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

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState("");

  const LIMIT = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      if (search) params.set("q", search);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/users/admin?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao carregar usuários");
      const data: ApiResponse = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar usuários"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function handleRoleFilter(role: string) {
    setRoleFilter(role);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gerenciar Usuários
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {total} {total === 1 ? "usuário cadastrado" : "usuários cadastrados"}
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </form>
        <div className="flex gap-2">
          {[
            { key: "", label: "Todos" },
            { key: "DOADOR", label: "Doadores" },
            { key: "RECEPTOR", label: "Receptores" },
            { key: "ADMIN", label: "Admins" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleRoleFilter(filter.key)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                roleFilter === filter.key
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
          <button
            onClick={fetchUsers}
            className="ml-auto font-medium underline hover:text-red-900"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="py-5">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0"
                >
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
                  </div>
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Users size={40} className="mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Nenhum usuário encontrado
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {search || roleFilter
              ? "Tente ajustar os filtros de busca."
              : "Nenhum usuário cadastrado ainda."}
          </p>
        </div>
      )}

      {/* Users table */}
      {!loading && users.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Usuário
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Email
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Função
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Localização
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Reputação
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Anúncios
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Cadastro
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <a
                          href={`/usuario/${user.id}`}
                          className="font-medium text-gray-900 hover:text-emerald-700"
                        >
                          {user.name}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{user.email}</td>
                    <td className="px-5 py-3">
                      <Badge variant={getRoleVariant(user.role)}>
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {[user.city, user.state].filter(Boolean).join(", ") || "-"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400" fill="currentColor" />
                        <span className="text-gray-700">
                          {user.reputation.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({user.reviewCount})
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {user._count?.announcements ?? 0}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={user.active ? "success" : "danger"}>
                        {user.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span className="px-3 text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
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
