"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao solicitar redefinição.");
        return;
      }

      setResetUrl(data.resetUrl || "");
      setSent(true);
    } catch {
      setError("Erro ao solicitar redefinição. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg">
        <h2 className="mb-2 text-center text-xl font-semibold text-gray-900">
          Recuperar senha
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Informe seu email para receber o link de redefinição.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Se este email estiver cadastrado, você receberá um link para
              redefinir a senha.
            </div>
            {resetUrl && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800">
                <p className="mb-2 font-medium">Modo demonstração</p>
                <p className="mb-2 text-xs">
                  Nenhum serviço de email configurado — use o link abaixo:
                </p>
                <Link
                  href={resetUrl}
                  className="block break-all font-mono text-xs text-emerald-700 underline"
                >
                  {resetUrl}
                </Link>
              </div>
            )}
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-9 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors cursor-pointer hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar link de redefinição"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Lembrou a senha?{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:text-emerald-700"
              >
                Entrar
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
