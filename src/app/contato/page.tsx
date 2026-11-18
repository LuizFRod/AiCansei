"use client";

import { useState, useCallback } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle, CheckCircle } from "lucide-react";
import HumanVerification, { type HumanValue } from "@/components/ui/HumanVerification";

export default function ContatoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("duvida");
  const [mensagem, setMensagem] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [human, setHuman] = useState<HumanValue>({});
  const [humanRefreshKey, setHumanRefreshKey] = useState(0);

  const loadCaptcha = useCallback(() => {
    setHumanRefreshKey((key) => key + 1);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!human.turnstileToken && !human.captchaAnswer?.trim()) {
      setError("Complete a verificação de humano.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          assunto,
          mensagem,
          ...human,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar mensagem. Tente novamente.");
        loadCaptcha();
        return;
      }

      setSent(true);
    } catch {
      setError("Ocorreu um erro ao enviar. Tente novamente.");
      loadCaptcha();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Fale Conosco</h1>
        <p className="mt-3 text-gray-600">
          Tem dúvidas, sugestões ou quer reportar um problema? Estamos aqui para ajudar.
        </p>
      </div>

      {/* Informações de contato */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Mail size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email</h3>
              <a
                href="mailto:10723667@mackenzista.com.br"
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                10723667@mackenzista.com.br
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Phone size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Telefone / WhatsApp</h3>
              <a
                href="https://wa.me/5527992545018"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                (27) 99254-5018
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <MapPin size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Localização</h3>
              <p className="text-sm text-gray-500">São Paulo, SP - Brasil</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Clock size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Horário de Atendimento</h3>
              <p className="text-sm text-gray-500">Seg - Sex: 9h às 18h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle size={20} className="text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">Envie uma mensagem</h2>
        </div>

        {sent ? (
          <div className="py-12 text-center">
            <CheckCircle size={48} className="mx-auto text-emerald-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Mensagem enviada!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Obrigado pelo contato. Responderemos em breve pelo email informado.
            </p>
            <button
              onClick={() => { setSent(false); setNome(""); setEmail(""); setMensagem(""); setAssunto("duvida"); loadCaptcha(); }}
              className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <>
            {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nome" className="mb-1 block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  id="nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="assunto" className="mb-1 block text-sm font-medium text-gray-700">
                Assunto
              </label>
              <select
                id="assunto"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
              >
                <option value="duvida">Dúvida geral</option>
                <option value="problema">Reportar problema</option>
                <option value="sugestao">Sugestão</option>
                <option value="denuncia">Denúncia</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label htmlFor="mensagem" className="mb-1 block text-sm font-medium text-gray-700">
                Mensagem
              </label>
              <textarea
                id="mensagem"
                required
                rows={5}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Descreva sua mensagem..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <HumanVerification
                value={human}
                onChange={setHuman}
                refreshKey={humanRefreshKey}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed"
              >
                {sending ? "Enviando..." : "Enviar mensagem"}
              </button>
            </div>
          </form>
          </>
        )}
      </div>
    </div>
  );
}
