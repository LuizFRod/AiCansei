import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface CityEntry {
  nome: string;
  uf: string;
}

let citiesCache: CityEntry[] | null = null;
let citiesPromise: Promise<CityEntry[]> | null = null;

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function loadCities(): Promise<CityEntry[]> {
  if (citiesCache) return citiesCache;
  if (!citiesPromise) {
    citiesPromise = fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome"
    )
      .then((res) => {
        if (!res.ok) throw new Error("IBGE indisponível");
        return res.json();
      })
      .then(
        (
          data: Array<{
            nome: string;
            microrregiao?: {
              mesorregiao?: { UF?: { sigla?: string } };
            };
          }>
        ) => {
          citiesCache = data.map((m) => ({
            nome: m.nome,
            uf: m.microrregiao?.mesorregiao?.UF?.sigla || "",
          }));
          return citiesCache;
        }
      )
      .catch((err) => {
        citiesPromise = null;
        throw err;
      });
  }
  return citiesPromise;
}

export async function GET(request: NextRequest) {
  const q = normalize(request.nextUrl.searchParams.get("q")?.trim() || "");

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const cities = await loadCities();
    const starts: CityEntry[] = [];
    const contains: CityEntry[] = [];

    for (const c of cities) {
      const n = normalize(c.nome);
      if (n.startsWith(q)) starts.push(c);
      else if (n.includes(q)) contains.push(c);
      if (starts.length >= 15) break;
    }

    return NextResponse.json([...starts, ...contains].slice(0, 15));
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar as cidades." },
      { status: 502 }
    );
  }
}
