"use client";

import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/constants";
import type { Category, Condition } from "@prisma/client";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  initialQuery?: string;
  initialFilters?: FilterState;
}

export interface FilterState {
  category: string;
  condition: string;
  city: string;
}

export function SearchBar({ onSearch, onFilterChange, initialQuery = "", initialFilters }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    category: "",
    condition: "",
    city: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query);
  }

  function handleFilterChange(key: keyof FilterState, value: string) {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  }

  function clearFilters() {
    const empty = { category: "", condition: "", city: "" };
    setFilters(empty);
    onFilterChange(empty);
  }

  const hasActiveFilters = filters.category || filters.condition || filters.city;

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, categoria ou localização..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-24 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-emerald-50 text-emerald-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filtros
          </button>
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); onSearch(""); }}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Todas categorias</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filters.condition}
            onChange={(e) => handleFilterChange("condition", e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Todas condições</option>
            {Object.entries(CONDITION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <input
            type="text"
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            placeholder="Cidade"
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none"
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-red-500 hover:text-red-700"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
