"use client";

import { useState } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Selecione uma nota de 1 a 5 estrelas");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit({ rating, comment });
      setRating(0);
      setComment("");
    } catch {
      setError("Erro ao enviar avaliação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-100 bg-white p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Deixe sua avaliação</h3>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Nota</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div>
        <label className="mb-1 block text-xs text-gray-500">Comentário (opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Como foi a experiência com este doador?"
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <Button type="submit" loading={loading} disabled={rating === 0}>
        Enviar avaliação
      </Button>
    </form>
  );
}
