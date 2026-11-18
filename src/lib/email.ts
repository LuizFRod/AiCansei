type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail({
  to,
  subject,
  html,
}: EmailPayload): Promise<{ delivered: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      `[email:demo] Para: ${to} | Assunto: ${subject}\n${html.replace(/<[^>]+>/g, " ").trim()}`
    );
    return { delivered: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "AiCansei <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      console.error("Resend error:", await res.text());
      return { delivered: false };
    }

    return { delivered: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { delivered: false };
  }
}

function baseLayout(inner: string): string {
  return `
    <div style="background:#f0fdf4;padding:32px 16px;font-family:'Segoe UI',sans-serif">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(5,150,105,.08)">
        <div style="background:linear-gradient(135deg,#d1fae5,#fef9c3);padding:28px;text-align:center;font-size:44px">🌱</div>
        <div style="padding:8px 32px 32px">${inner}</div>
        <div style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px">
          Feito com 💚 pela comunidade AiCansei
        </div>
      </div>
    </div>`;
}

export function welcomeEmail(name: string) {
  const url =
    process.env.NEXTAUTH_URL || "https://aicansei.vercel.app";

  return {
    subject: "Que alegria ter você aqui! 🌱✨",
    html: baseLayout(`
      <h2 style="color:#065f46;margin:20px 0 8px;text-align:center">Oiie, ${name}! 💚</h2>
      <p style="color:#374151;line-height:1.6;text-align:center">
        Sua conta foi criadinha com sucesso e nós estamos muito felizes em te ver por aqui! ✨
      </p>
      <div style="background:#f0fdf4;border-radius:16px;padding:18px 22px;margin:22px 0">
        <p style="margin:6px 0;color:#374151;line-height:1.7">📦 Doe aquilo que não usa mais</p>
        <p style="margin:6px 0;color:#374151;line-height:1.7">🔍 Encontre o que você precisa</p>
        <p style="margin:6px 0;color:#374151;line-height:1.7">🤝 E transforme objetos em carinho</p>
      </div>
      <p style="text-align:center;margin:26px 0">
        <a href="${url}/feed" style="display:inline-block;background:#10b981;color:#fff;padding:14px 36px;border-radius:999px;text-decoration:none;font-weight:bold">
          Começar agora 🌟
        </a>
      </p>
      <p style="color:#9ca3af;font-size:12px;text-align:center;line-height:1.5">
        Você não solicitou esta conta? Só ignorar este email, tá? 😉
      </p>
    `),
  };
}

export function passwordResetEmail(name: string, resetUrl: string) {
  return {
    subject: "Recuperar sua senha 🌱🔑",
    html: baseLayout(`
      <h2 style="color:#065f46;margin:20px 0 8px;text-align:center">Ops, esqueceu a senha? 🔑</h2>
      <p style="color:#374151;line-height:1.6;text-align:center">
        Relaxa que acontece! ${name}, criamos um link especial pra você criar uma senha novinha.
      </p>
      <p style="text-align:center;margin:26px 0">
        <a href="${resetUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:14px 36px;border-radius:999px;text-decoration:none;font-weight:bold">
          Criar nova senha 🌷
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;text-align:center;line-height:1.5">
        ⏰ O link é válido por <strong>30 minutinhos</strong>.
      </p>
      <p style="color:#9ca3af;font-size:12px;text-align:center;line-height:1.5">
        Não foi você quem pediu? Ignora essa mensagem que sua senha continua a mesma. 💛
      </p>
    `),
  };
}
