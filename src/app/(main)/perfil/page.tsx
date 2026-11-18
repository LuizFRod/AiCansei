"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Mail, MapPin, Camera, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { formatDate } from "@/lib/utils";

export default function PerfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");

  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user) {
      setName(session.user.name || "");
      // Fetch additional profile data
      fetch("/api/users/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.city) setCity(data.city);
          if (data.state) setState(data.state);
          if (data.phone) setPhone(data.phone);
        })
        .catch(() => {});
    }
  }, [status, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city, state, phone }),
      });
      if (res.ok) {
        setSuccess("Perfil atualizado com sucesso!");
        await update();
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao atualizar perfil");
      }
    } catch {
      setError("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwLoading(true);
    setPwError("");
    setPwSuccess("");

    if (newPassword !== confirmPw) {
      setPwError("As senhas não conferem.");
      setPwLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword: confirmPw }),
      });
      const data = await res.json();

      if (res.ok) {
        setPwSuccess("Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPw("");
      } else {
        setPwError(data.error || "Erro ao alterar senha");
      }
    } catch {
      setPwError("Erro ao alterar senha");
    } finally {
      setPwLoading(false);
    }
  }

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>

      {/* Profile header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  (session.user.name || "U").charAt(0).toUpperCase()
                )}
              </div>
              <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:text-emerald-600">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{session.user.name}</h2>
              <p className="text-sm text-gray-500">{session.user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <StarRating value={0} size="sm" />
                <span className="text-xs text-gray-400">Reputação</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Editar informações</h3>

          {success && (
            <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>
          )}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Nome</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={session.user.email || ""}
                  disabled
                  className="w-full rounded-lg border border-gray-100 bg-gray-50 py-2.5 pr-4 pl-9 text-sm text-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Cidade</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Sua cidade"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Estado</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={loading}>
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Alterar senha */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Alterar senha</h3>

          {pwSuccess && (
            <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{pwSuccess}</div>
          )}
          {pwError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{pwError}</div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Senha atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Sua senha atual"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Nova senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mín. 8 caracteres"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Confirmar nova senha</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Repita a nova senha"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={pwLoading}>
                Alterar senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Membro desde */}
      <Card>
        <CardContent className="py-4">
          <p className="text-xs text-gray-500">
            Membro desde {formatDate(new Date().toISOString())}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
