import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface CepResult {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  cep: string;
}

export async function GET(request: NextRequest) {
  const raw = (request.nextUrl.searchParams.get("cep") || "").replace(/\D/g, "");

  if (raw.length !== 8) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
    if (!res.ok) throw new Error("ViaCEP indisponível");
    const data = await res.json();

    if (data.erro) {
      return NextResponse.json({ error: "CEP não encontrado." }, { status: 404 });
    }

    const result: CepResult = {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      localidade: data.localidade || "",
      uf: data.uf || "",
      cep: data.cep || raw,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching CEP:", error);
    return NextResponse.json(
      { error: "Não foi possível consultar o CEP agora." },
      { status: 502 }
    );
  }
}
