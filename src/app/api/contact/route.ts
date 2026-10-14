import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, assunto, mensagem } = body;

    if (!nome || !email || !mensagem) {
      return NextResponse.json(
        { error: "Nome, email e mensagem são obrigatórios." },
        { status: 400 }
      );
    }

    // Log the contact message (in production, send email or save to DB)
    console.log("📧 Nova mensagem de contato:", {
      nome,
      email,
      assunto,
      mensagem,
      data: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Mensagem recebida com sucesso!",
    });
  } catch (error) {
    console.error("Error processing contact:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
