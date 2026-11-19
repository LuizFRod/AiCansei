"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageCircle, Send } from "lucide-react";

type Conversation = {
  announcementId: string;
  announcementTitle: string;
  announcementPhoto: string | null;
  otherUser: { id: string; name: string; photo: string | null };
  lastMessage: string;
  lastAt: string;
  unread: number;
};

type ThreadMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string; photo: string | null };
};

type ThreadMeta = {
  id: string;
  title: string;
  status: "ATIVO" | "DOADO" | string;
  donorId: string;
};

export default function MensagensPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [active, setActive] = useState<{ announcementId: string; userId: string; title: string; name: string } | null>(null);
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [meta, setMeta] = useState<ThreadMeta | null>(null);
  const [donating, setDonating] = useState(false);
  const [justDonated, setJustDonated] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const list: Conversation[] = await res.json();
        setConversations(list);
        if (!booted) {
          setBooted(true);
          const params = new URLSearchParams(window.location.search);
          const a = params.get("a");
          const u = params.get("u");
          if (a && u && !active) {
            const match = list.find(
              (c) => c.announcementId === a && c.otherUser.id === u
            );
            setActive({
              announcementId: a,
              userId: u,
              title: match?.announcementTitle || "Anúncio",
              name: match?.otherUser.name || "Usuário",
            });
          }
        }
      }
    } catch {}
    setLoadingList(false);
  }, [booted, active]);

  useEffect(() => {
    if (session?.user) loadConversations();
  }, [session, loadConversations]);

  const loadThread = useCallback(async () => {
    if (!active) return;
    try {
      const res = await fetch(
        `/api/messages?announcementId=${active.announcementId}&userId=${active.userId}`
      );
      if (res.ok) {
        const data = await res.json();
        setThread(data.messages);
        setMeta(data.announcement);
        if (data.announcement?.status === "DOADO") setJustDonated(true);
        loadConversations();
      }
    } catch {}
  }, [active, loadConversations]);

  async function handleDonate() {
    if (!active || !meta) return;
    const ok = window.confirm(
      `Doar "${meta.title}" para ${active.name}? O anúncio será finalizado.`
    );
    if (!ok) return;
    setDonating(true);
    try {
      const res = await fetch(`/api/announcements/${active.announcementId}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: active.userId }),
      });
      if (res.ok) {
        setJustDonated(true);
        loadThread();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao finalizar doação");
      }
    } catch {
      alert("Erro ao finalizar doação");
    } finally {
      setDonating(false);
    }
  }

  useEffect(() => {
    loadThread();
    if (!active) return;
    const timer = setInterval(loadThread, 5000);
    return () => clearInterval(timer);
  }, [active, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementId: active.announcementId,
          recipientId: active.userId,
          content: draft.trim(),
        }),
      });

      if (res.ok) {
        setDraft("");
        loadThread();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao enviar mensagem");
      }
    } catch {
      alert("Erro ao enviar mensagem");
    } finally {
      setSending(false);
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
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mensagens</h1>

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        {/* Lista de conversas */}
        <div className={`rounded-2xl border border-gray-100 bg-white md:h-[600px] md:overflow-y-auto ${active ? "hidden md:block" : ""}`}>
          {loadingList ? (
            <p className="p-6 text-sm text-gray-400">Carregando...</p>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle size={32} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">
                Nenhuma conversa ainda.
                <br />
                Entre em um anúncio e fale com o doador!
              </p>
            </div>
          ) : (
            conversations.map((c) => {
              const isActive =
                active?.announcementId === c.announcementId &&
                active?.userId === c.otherUser.id;
              return (
                <button
                  key={`${c.announcementId}-${c.otherUser.id}`}
                  onClick={() =>
                    setActive({
                      announcementId: c.announcementId,
                      userId: c.otherUser.id,
                      title: c.announcementTitle,
                      name: c.otherUser.name,
                    })
                  }
                  className={`w-full border-b border-gray-50 p-4 text-left transition-colors hover:bg-gray-50 ${
                    isActive ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {c.otherUser.name}
                      </p>
                      <p className="truncate text-xs text-emerald-700">
                        {c.announcementTitle}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {c.lastMessage}
                      </p>
                    </div>
                    {c.unread > 0 && (
                      <span className="mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Thread */}
        <div className={`rounded-2xl border border-gray-100 bg-white md:flex md:h-[600px] md:flex-col ${active ? "flex flex-col h-[70vh]" : "hidden"}`}>
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                <button
                  onClick={() => setActive(null)}
                  className="md:hidden"
                  aria-label="Voltar"
                >
                  <ArrowLeft size={18} className="text-gray-500" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{active.name}</p>
                  <p className="truncate text-xs text-emerald-700">{meta?.title || active.title}</p>
                </div>
                {meta &&
                  session.user.id === meta.donorId &&
                  meta.status === "ATIVO" && (
                    <button
                      onClick={handleDonate}
                      disabled={donating}
                      className="shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-300"
                    >
                      {donating ? "Doando..." : "Doar para essa pessoa 💚"}
                    </button>
                  )}
              </div>

              {justDonated && meta?.status === "DOADO" && (
                <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-2.5 text-center text-xs font-semibold text-emerald-700">
                  🎉 Item doado para {active.name}! Anúncio finalizado.
                </div>
              )}

              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {thread.length === 0 && (
                  <p className="pt-10 text-center text-sm text-gray-400">
                    Envie a primeira mensagem! 👋
                  </p>
                )}
                {thread.map((m) => {
                  const mine = m.senderId === session.user.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          mine
                            ? "rounded-br-md bg-emerald-600 text-white"
                            : "rounded-bl-md bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={`mt-1 text-right text-[10px] ${mine ? "text-emerald-200" : "text-gray-400"}`}>
                          {new Date(m.createdAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-100 p-3">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-300"
                  aria-label="Enviar"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="hidden h-full items-center justify-center md:flex">
              <p className="text-sm text-gray-400">Selecione uma conversa 💬</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
