"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Eye, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface PendingAnnouncement {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  city: string | null;
  state: string | null;
  createdAt: string;
  donor: {
    id: string;
    name: string;
    email: string;
  };
  photos: { url: string }[];
}

interface ModerationQueueProps {
  announcements: PendingAnnouncement[];
  onModerate: (id: string, action: "APROVADO" | "REJEITADO", reason?: string) => Promise<void>;
}

export function ModerationQueue({ announcements, onModerate }: ModerationQueueProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function handleModerate(id: string, action: "APROVADO" | "REJEITADO") {
    setLoading(id);
    await onModerate(id, action, action === "REJEITADO" ? rejectReason : undefined);
    setLoading(null);
    setRejectReason("");
    setExpandedId(null);
  }

  if (announcements.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white py-12 text-center">
        <CheckCircle size={32} className="mx-auto text-emerald-400" />
        <p className="mt-3 text-sm text-gray-500">Nenhum anúncio pendente de moderação</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((a) => (
        <Card key={a.id}>
          <CardContent className="pt-5">
            <div className="flex items-start gap-4">
              {a.photos[0] && (
                <img
                  src={a.photos[0].url}
                  alt={a.title}
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{a.title}</h3>
                  <Badge variant="outline">{CATEGORY_LABELS[a.category]}</Badge>
                  <Badge variant="default">{CONDITION_LABELS[a.condition]}</Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Por {a.donor.name} ({a.donor.email})
                  {a.city && <span className="ml-2 flex items-center gap-1 inline-flex"><MapPin size={10} />{a.city}{a.state && `, ${a.state}`}</span>}
                  <span className="ml-2">{formatDate(a.createdAt)}</span>
                </p>

                {expandedId === a.id && (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm text-gray-600">{a.description}</p>
                    {a.photos.length > 1 && (
                      <div className="flex gap-2">
                        {a.photos.map((p, i) => (
                          <img key={i} src={p.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                        ))}
                      </div>
                    )}
                    <div>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Motivo da rejeição (opcional)"
                        rows={2}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        loading={loading === a.id}
                        onClick={() => handleModerate(a.id, "APROVADO")}
                      >
                        <CheckCircle size={14} /> Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={loading === a.id}
                        onClick={() => handleModerate(a.id, "REJEITADO")}
                      >
                        <XCircle size={14} /> Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(null)}
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                )}

                {expandedId !== a.id && (
                  <button
                    onClick={() => setExpandedId(a.id)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800"
                  >
                    <Eye size={14} /> Revisar
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
