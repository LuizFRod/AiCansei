import { Heart, Users, Package, Shield } from "lucide-react";
import Link from "next/link";

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sobre o AiCansei</h1>
        <p className="mt-4 text-lg text-gray-600">
          Doe o que não usa mais. Encontre coisas incríveis. Conecte pessoas.
        </p>
      </div>

      {/* Missão */}
      <section className="rounded-2xl border border-gray-100 bg-white p-8">
        <h2 className="text-xl font-semibold text-gray-900">Nossa Missão</h2>
        <p className="mt-3 text-gray-600 leading-relaxed">
          O AiCansei nasceu da ideia simples de que ninguém deveria jogar fora algo que ainda pode fazer a diferença na vida de outra pessoa. Somos uma plataforma de doação que conecta quem tem itens em bom estado — mas não usa mais — a quem precisa ou quer dar uma nova chance a esses objetos.
        </p>
        <p className="mt-3 text-gray-600 leading-relaxed">
          Acreditamos que doar é mais do que entregar um item: é criar conexões, reduzir o desperdício e fortalecer a comunidade. Nosso nome vem do sentimento que todos já tivemos: &ldquo;Ai, cansei desse item&rdquo; — e em vez de jogar fora, você pode doar.
        </p>
      </section>

      {/* Como funciona */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 text-center">Como Funciona</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Package size={24} className="text-emerald-600" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">Anuncie</h3>
            <p className="mt-2 text-sm text-gray-500">
              Tire uma foto, descreva o item e publique em segundos.
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Users size={24} className="text-emerald-600" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">Conecte-se</h3>
            <p className="mt-2 text-sm text-gray-500">
              Interessados manifestam interesse, e você escolhe o receptor.
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Heart size={24} className="text-emerald-600" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">Doe</h3>
            <p className="mt-2 text-sm text-gray-500">
              Combine a entrega ou retirada e avalie a experiência.
            </p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="rounded-2xl border border-gray-100 bg-white p-8">
        <h2 className="text-xl font-semibold text-gray-900">Nossos Valores</h2>
        <ul className="mt-4 space-y-3">
          <li className="flex items-start gap-3">
            <Shield size={20} className="mt-0.5 shrink-0 text-emerald-500" />
            <div>
              <span className="font-medium text-gray-900">Transparência</span>
              <p className="text-sm text-gray-500">Todas as doações são documentadas e os usuários são avaliados.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Heart size={20} className="mt-0.5 shrink-0 text-emerald-500" />
            <div>
              <span className="font-medium text-gray-900">Comunidade</span>
              <p className="text-sm text-gray-500">Acreditamos no poder da solidariedade entre vizinhos e cidades.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Package size={20} className="mt-0.5 shrink-0 text-emerald-500" />
            <div>
              <span className="font-medium text-gray-900">Sustentabilidade</span>
              <p className="text-sm text-gray-500">Cada item doado é um item a menos no lixo. Reduzimos desperdício juntos.</p>
            </div>
          </li>
        </ul>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/cadastro"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Comece a doar agora
        </Link>
      </div>
    </div>
  );
}
