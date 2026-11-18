import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyHuman } from "@/lib/captcha";

const contactSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.email("Email inválido"),
  assunto: z.string().max(150, "Assunto muito longo").optional(),
  mensagem: z
    .string()
    .min(1, "Mensagem é obrigatória")
    .max(2000, "Mensagem muito longa"),
  captchaToken: z.string().optional(),
  captchaAnswer: z.union([z.string(), z.number()]).optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(`contact:${clientIp(request)}`, 5, 3_600_000)) {
      return NextResponse.json(
        { error: "Muitas mensagens enviadas. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Dados inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (!(await verifyHuman(result.data))) {
      return NextResponse.json(
        { error: "Verificação de humano inválida ou expirada." },
        { status: 400 }
      );
    }

    const { nome, email, assunto, mensagem } = result.data;
    const sanitize = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

    console.log("=== Nova mensagem de contato ===");
    console.log(`Nome: ${sanitize(nome)}`);
    console.log(`Email: ${sanitize(email)}`);
    console.log(`Assunto: ${assunto ? sanitize(assunto) : "(sem assunto)"}`);
    console.log(`Mensagem: ${sanitize(mensagem)}`);

    return NextResponse.json({
      message:
        "Mensagem recebida com sucesso! Entraremos em contato em breve.",
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
