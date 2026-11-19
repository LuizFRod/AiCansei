import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface StreetEntry {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  cep: string;
}

interface CacheEntry {
  streets: StreetEntry[];
  ts: number;
}

const streetCache = new Map<string, CacheEntry>();
const TTL = 10 * 60 * 1000;

export async function GET(request: NextRequest) {
  const uf = (request.nextUrl.searchParams.get("uf") || "").trim().toUpperCase();
  const city = (request.nextUrl.searchParams.get("city") || "").trim();
  const q = (request.nextUrl.searchParams.get("q") || "").trim();

  if (!uf || !city || q.length < 3) {
    return NextResponse.json({ streets: [] });
  }

  if (!/^[A-Z]{2}$/.test(uf)) {
    return NextResponse.json({ error: "UF inválida." }, { status: 400 });
  }

  const key = `${uf}|${city.toLowerCase()}|${q.toLowerCase()}`;
  const cached = streetCache.get(key);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json({ streets: cached.streets });
  }

  try {
    const url = `https://viacep.com.br/ws/${encodeURIComponent(
      uf
    )}/${encodeURIComponent(city)}/${encodeURIComponent(q)}/json/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("ViaCEP indisponível");
    const data = await res.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ streets: [] });
    }

    const streets: StreetEntry[] = data
      .filter((s: { logradouro?: string }) => s.logradouro)
      .slice(0, 10)
      .map((s: {
        logradouro: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
        cep?: string;
      }) => ({
        logradouro: s.logradouro,
        bairro: s.bairro || "",
        localidade: s.localidade || city,
        uf: s.uf || uf,
        cep: s.cep || "",
      }));

    streetCache.set(key, { streets, ts: Date.now() });

    return NextResponse.json({ streets });
  } catch (error) {
    console.error("Error fetching address suggestions:", error);
    return NextResponse.json(
      { error: "Não foi possível buscar endereços agora." },
      { status: 502 }
    );
  }
}
