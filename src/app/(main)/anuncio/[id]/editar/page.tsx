"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/announcements/ImageUpload";
import { LocationPicker } from "@/components/ui/LocationPicker";
import { AddressPicker } from "@/components/ui/AddressPicker";
import { CATEGORY_LABELS, CONDITION_LABELS, AVAILABILITY_LABELS } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import type { Category, Condition, Availability } from "@prisma/client";

export default function EditarAnuncioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [condition, setCondition] = useState<Condition | "">("");
  const [availability, setAvailability] = useState<Availability | "">("RETIRADA");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch(`/api/announcements/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setTitle(data.title || "");
            setDescription(data.description || "");
            setCategory(data.category || "");
            setCondition(data.condition || "");
            setAvailability(data.availability || "RETIRADA");
            setCity(data.city || "");
            setStateUf(data.state || "");
            setAddress(data.address || "");
            setCep(data.cep || "");
            setPhotos(data.photos?.map((p: { url: string }) => p.url) || []);

            if (data.donor?.id !== session?.user?.id) {
              setError("Você não tem permissão para editar este anúncio.");
            }
          }
        })
        .catch(() => setError("Erro ao carregar anúncio"))
        .finally(() => setFetching(false));
    }
  }, [id, status, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !condition) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          condition,
          availability: availability || "RETIRADA",
          city: city || undefined,
          state: stateUf || undefined,
          address: address || undefined,
          cep: cep || undefined,
          photos: photos.map((url, i) => ({ url, sortOrder: i })),
        }),
      });

      if (res.ok) {
        router.push(`/anuncio/${id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao salvar alterações");
      }
    } catch {
      setError("Erro ao salvar alterações");
    } finally {
      setLoading(false);
    }
  }

  if (fetching || status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-4xl">😢</span>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">{error}</h2>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm font-medium text-emerald-600 underline"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar anúncio</h1>
        <p className="mt-1 text-sm text-gray-500">
          Atualize as informações do seu anúncio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Título do anúncio *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Sofá de 3 lugares em bom estado"
                required
                maxLength={100}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="mt-1 text-xs text-gray-400">{title.length}/100</p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Descrição *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o item: estado, motivo da doação, etc."
                required
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Selecione</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Condição *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Condition)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Selecione</option>
                  {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Disponibilidade
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as Availability)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {Object.entries(AVAILABILITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h3 className="text-xs font-medium text-gray-700">Localização</h3>
            <LocationPicker
              city={city}
              state={stateUf}
              onCityChange={setCity}
              onStateChange={setStateUf}
            />
            <AddressPicker
              city={city}
              state={stateUf}
              address={address}
              cep={cep}
              onAddressChange={setAddress}
              onCepChange={setCep}
              onCityChange={setCity}
              onStateChange={setStateUf}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h3 className="text-xs font-medium text-gray-700">Fotos (até 5)</h3>
            <ImageUpload onUpload={setPhotos} maxImages={5} existingImages={photos} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading} size="lg">
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
