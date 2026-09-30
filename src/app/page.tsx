import Link from "next/link";
import Footer from "@/components/layout/Footer";

const FEATURES = [
  {
    icon: "\u{1F4E6}",
    title: "Anuncie em segundos",
    description: "Publique o que quer doar em poucos passos",
  },
  {
    icon: "\u{1F50D}",
    title: "Encontre o que precisa",
    description: "Busque itens por categoria, localizacao e mais",
  },
  {
    icon: "\u{1F91D}",
    title: "Conecte-se",
    description: "Entre em contato direto com doadores",
  },
];

const STATS = [
  { value: "1.2k+", label: "Usuarios" },
  { value: "500+", label: "Doacoes" },
  { value: "800+", label: "Anuncios" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-100/50" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-100/30" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block text-5xl">🌱</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Transforme o que voce nao usa em{" "}
            <span className="text-emerald-600">ajuda para alguem</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
            O AiCansei conecta quem quer doar com quem precisa. Simples, rapido
            e gratuito.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/feed"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Comece a Doar
            </Link>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:border-emerald-500 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Encontre Itens
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Como funciona
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-500">
            Doar ou encontrar itens nunca foi tao facil
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="mb-4 inline-block text-4xl">
                  {feature.icon}
                </span>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-extrabold text-emerald-600 sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-emerald-600 px-8 py-12 text-center shadow-lg sm:px-12 sm:py-16">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Pronto para comecar?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-emerald-100">
            Junte-se a milhares de pessoas que ja estao fazendo a diferenca
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50"
            >
              Criar Conta Gratis
            </Link>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-400 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Explorar Anuncios
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
