"use client";

import { useEffect, useRef, useState } from "react";

interface StreetItem {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  cep: string;
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export function AddressPicker({
  city,
  state,
  address,
  cep,
  onAddressChange,
  onCepChange,
  onCityChange,
  onStateChange,
}: {
  city: string;
  state: string;
  address: string;
  cep: string;
  onAddressChange: (address: string) => void;
  onCepChange: (cep: string) => void;
  onCityChange: (city: string) => void;
  onStateChange: (uf: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<StreetItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cepMessage, setCepMessage] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const skipNextSearch = useRef(false);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function searchStreets(q: string) {
    if (!state || !city || q.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(
      `/api/locations/address?uf=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&q=${encodeURIComponent(q.trim())}`
    )
      .then((r) => (r.ok ? r.json() : { streets: [] }))
      .then((d) => {
        setSuggestions(d.streets || []);
        setOpen(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    const t = setTimeout(() => searchStreets(address), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  function pickStreet(s: StreetItem) {
    skipNextSearch.current = true;
    const parts = s.bairro ? `${s.logradouro}, ${s.bairro}` : s.logradouro;
    onAddressChange(parts);
    if (s.cep) onCepChange(s.cep);
    setOpen(false);
  }

  async function lookupCep(value: string) {
    const digits = value.replace(/\D/g, "");
    setCepMessage(null);
    if (digits.length !== 8) return;

    try {
      const res = await fetch(`/api/locations/cep?cep=${digits}`);
      if (!res.ok) {
        setCepMessage("CEP não encontrado");
        return;
      }
      const d: StreetItem = await res.json();
      if (d.logradouro && !address.trim()) {
        skipNextSearch.current = true;
        onAddressChange(d.bairro ? `${d.logradouro}, ${d.bairro}` : d.logradouro);
      }
      if (d.localidade && d.uf) {
        onCityChange(d.localidade);
        onStateChange(d.uf);
      }
      setCepMessage(null);
    } catch {
      setCepMessage("Não foi possível consultar o CEP");
    }
  }

  function formatCep(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  }

  const canSuggest = Boolean(state && city);

  return (
    <div ref={boxRef} className="space-y-3">
      <div className="relative">
        <label className="mb-1 block text-xs text-gray-500">
          Endereço (opcional)
          {!canSuggest && (
            <span className="ml-1 text-[10px] text-gray-400">
              — escolha cidade e estado para sugestões
            </span>
          )}
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => {
            onAddressChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => canSuggest && suggestions.length > 0 && setOpen(true)}
          placeholder={canSuggest ? "Comece a digitar a rua..." : "Rua, número, bairro"}
          autoComplete="off"
          className={inputClass}
        />
        {open && canSuggest && address.trim().length >= 3 && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg">
            {loading ? (
              <p className="p-3 text-xs text-gray-400">Buscando ruas...</p>
            ) : suggestions.length === 0 ? (
              <p className="p-3 text-xs text-gray-400">Nenhuma rua encontrada</p>
            ) : (
              suggestions.map((s, i) => (
                <button
                  key={`${s.cep}-${i}`}
                  type="button"
                  onClick={() => pickStreet(s)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-emerald-50"
                >
                  <span>
                    <span className="block text-sm text-gray-700">{s.logradouro}</span>
                    {s.bairro && (
                      <span className="block text-xs text-gray-400">{s.bairro}</span>
                    )}
                  </span>
                  {s.cep && (
                    <span className="shrink-0 text-xs font-semibold text-emerald-600">
                      {s.cep}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">CEP (opcional)</label>
        <input
          type="text"
          value={cep}
          onChange={(e) => onCepChange(formatCep(e.target.value))}
          onBlur={(e) => lookupCep(e.target.value)}
          placeholder="00000-000"
          maxLength={9}
          inputMode="numeric"
          autoComplete="off"
          className={inputClass}
        />
        {cepMessage && (
          <p className="mt-1 text-xs text-amber-600">{cepMessage}</p>
        )}
      </div>
    </div>
  );
}
