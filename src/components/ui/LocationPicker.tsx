"use client";

import { useEffect, useRef, useState } from "react";

interface StateItem {
  uf: string;
  nome: string;
}

interface CityItem {
  nome: string;
  uf: string;
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export function LocationPicker({
  city,
  state,
  onCityChange,
  onStateChange,
}: {
  city: string;
  state: string;
  onCityChange: (city: string) => void;
  onStateChange: (uf: string) => void;
}) {
  const [stateQuery, setStateQuery] = useState(state);
  const [cityQuery, setCityQuery] = useState(city);
  const [states, setStates] = useState<StateItem[]>([]);
  const [cityResults, setCityResults] = useState<CityItem[]>([]);
  const [openStates, setOpenStates] = useState(false);
  const [openCities, setOpenCities] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/locations/states")
      .then((r) => (r.ok ? r.json() : []))
      .then(setStates)
      .catch(() => setStates([]));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) {
        setOpenStates(false);
        setOpenCities(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (openCities && cityQuery.trim().length >= 2) {
      setLoadingCities(true);
      const t = setTimeout(() => {
        fetch(`/api/locations/cities?q=${encodeURIComponent(cityQuery.trim())}`)
          .then((r) => (r.ok ? r.json() : []))
          .then((data: CityItem[]) => {
            setCityResults(data);
            setLoadingCities(false);
          })
          .catch(() => setLoadingCities(false));
      }, 300);
      return () => clearTimeout(t);
    }
    setCityResults([]);
    setLoadingCities(false);
  }, [cityQuery, openCities]);

  const filteredStates =
    stateQuery.trim().length === 0
      ? states
      : states.filter(
          (s) =>
            s.uf.toLowerCase().startsWith(stateQuery.trim().toLowerCase()) ||
            s.nome
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .includes(
                stateQuery
                  .trim()
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
              )
        );

  function pickCity(c: CityItem) {
    onCityChange(c.nome);
    if (c.uf) onStateChange(c.uf);
    setCityQuery(c.nome);
    setStateQuery(c.uf);
    setOpenCities(false);
  }

  return (
    <div ref={boxRef} className="grid grid-cols-2 gap-3">
      <div className="relative">
        <label className="mb-1 block text-xs text-gray-500">Cidade</label>
        <input
          type="text"
          value={cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value);
            setOpenCities(true);
            setOpenStates(false);
          }}
          onFocus={() => {
            setOpenCities(true);
            setOpenStates(false);
          }}
          placeholder="Digite para buscar..."
          autoComplete="off"
          className={inputClass}
        />
        {openCities && cityQuery.trim().length >= 2 && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg">
            {loadingCities ? (
              <p className="p-3 text-xs text-gray-400">Buscando...</p>
            ) : cityResults.length === 0 ? (
              <p className="p-3 text-xs text-gray-400">Nenhuma cidade encontrada</p>
            ) : (
              cityResults.map((c, i) => (
                <button
                  key={`${c.nome}-${c.uf}-${i}`}
                  type="button"
                  onClick={() => pickCity(c)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-emerald-50"
                >
                  <span>{c.nome}</span>
                  <span className="text-xs font-semibold text-emerald-600">{c.uf}</span>
                </button>
              ))
            )}
          </div>
        )}
        {openCities && cityQuery.trim().length > 0 && cityQuery.trim().length < 2 && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-100 bg-white p-3 shadow-lg">
            <p className="text-xs text-gray-400">Digite pelo menos 2 letras...</p>
          </div>
        )}
      </div>

      <div className="relative">
        <label className="mb-1 block text-xs text-gray-500">Estado</label>
        <input
          type="text"
          value={stateQuery}
          onChange={(e) => {
            setStateQuery(e.target.value);
            setOpenStates(true);
            setOpenCities(false);
          }}
          onFocus={() => {
            setOpenStates(true);
            setOpenCities(false);
          }}
          placeholder="UF ou nome"
          autoComplete="off"
          className={inputClass}
        />
        {openStates && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg">
            {filteredStates.length === 0 ? (
              <p className="p-3 text-xs text-gray-400">Nenhum estado encontrado</p>
            ) : (
              filteredStates.map((s) => (
                <button
                  key={s.uf}
                  type="button"
                  onClick={() => {
                    onStateChange(s.uf);
                    setStateQuery(s.uf);
                    setOpenStates(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-emerald-50"
                >
                  <span>{s.nome}</span>
                  <span className="text-xs font-semibold text-emerald-600">{s.uf}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
