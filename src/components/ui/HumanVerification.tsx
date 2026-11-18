"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type HumanValue = {
  turnstileToken?: string;
  captchaToken?: string;
  captchaAnswer?: string;
};

type ChallengeResponse =
  | { mode: "math"; question: string; token: string }
  | { mode: "turnstile"; siteKey: string };

interface Props {
  value: HumanValue;
  onChange: (value: HumanValue) => void;
  refreshKey?: number;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: Record<string, unknown>
      ) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

export default function HumanVerification({
  value,
  onChange,
  refreshKey = 0,
}: Props) {
  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    onChange({});
    try {
      const res = await fetch("/api/captcha");
      if (res.ok) setChallenge(await res.json());
    } catch {}
  }, [onChange]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    const siteKey =
      challenge && challenge.mode === "turnstile" ? challenge.siteKey : null;

    if (!siteKey || !widgetRef.current) {
      return;
    }

    function renderWidget() {
      if (!window.turnstile || !widgetRef.current || widgetIdRef.current) {
        return;
      }
      window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onChange({ turnstileToken: token }),
        "expired-callback": () => onChange({}),
        theme: "light",
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      if (!document.querySelector('script[src*="challenges.cloudflare.com"]')) {
        const script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.addEventListener("load", renderWidget);
        document.head.appendChild(script);
      } else {
        const timer = setInterval(() => {
          if (window.turnstile) {
            clearInterval(timer);
            renderWidget();
          }
        }, 200);
        return () => clearInterval(timer);
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [challenge, onChange]);

  if (!challenge) {
    return (
      <p className="text-sm text-gray-400">Carregando verificação...</p>
    );
  }

  if (challenge.mode === "turnstile") {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Verificação de humano
        </label>
        <div ref={widgetRef} />
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor="human-answer"
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        Verificação de humano:{" "}
        <span className="font-semibold text-emerald-700">
          {challenge.question}
        </span>
      </label>
      <div className="flex gap-2">
        <input
          id="human-answer"
          type="text"
          inputMode="numeric"
          required
          value={value.captchaAnswer ?? ""}
          onChange={(e) =>
            onChange({
              captchaToken: challenge.token,
              captchaAnswer: e.target.value,
            })
          }
          placeholder="Sua resposta"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <button
          type="button"
          onClick={load}
          title="Gerar nova pergunta"
          className="cursor-pointer rounded-lg border border-gray-300 px-3 text-gray-500 transition-colors hover:bg-gray-50"
        >
          ↻
        </button>
      </div>
    </div>
  );
}
