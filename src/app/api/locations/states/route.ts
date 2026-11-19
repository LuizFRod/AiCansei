import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let statesCache: Array<{ uf: string; nome: string }> | null = null;

export async function GET() {
  try {
    if (!statesCache) {
      const res = await fetch(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
      );
      if (!res.ok) throw new Error("IBGE indisponível");
      const data = await res.json();
      statesCache = data.map((e: { sigla: string; nome: string }) => ({
        uf: e.sigla,
        nome: e.nome,
      }));
    }
    return NextResponse.json(statesCache);
  } catch (error) {
    console.error("Error fetching states:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os estados." },
      { status: 502 }
    );
  }
}
