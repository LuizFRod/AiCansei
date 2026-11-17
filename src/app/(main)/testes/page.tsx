import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plano de testes e resultados | AiCansei",
  description: "Plano de testes, resultados executados e métricas de qualidade do AiCansei.",
};

const groups = [
  { area: "APIs", files: 2, tests: 52, examples: "Listagem e cadastro de anúncios; favoritos, autenticação e respostas de erro." },
  { area: "Funções e validações", files: 3, tests: 157, examples: "Constantes, formatação, utilitários e validação de entradas." },
  { area: "Componentes de interface", files: 4, tests: 81, examples: "Badge, Button, Card e StarRating." },
];

const total = groups.reduce((sum, group) => sum + group.tests, 0);
const passed = 290;
const failed = total - passed;

export default function TestesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-10">
      <header className="rounded-2xl bg-emerald-950 px-6 py-10 text-white sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">Qualidade do projeto</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Plano de testes e resultados</h1>
        <p className="mt-4 max-w-3xl text-emerald-50/90">
          Evidências da suíte automatizada do AiCansei, executada em 17/11/2026 sobre o código da branch main.
          Os números abaixo se referem a esta execução local, não a testes manuais ou ao ambiente de produção.
        </p>
      </header>

      <section aria-labelledby="plano" className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 id="plano" className="text-2xl font-semibold">Plano de testes</h2>
        <p className="mt-3 text-gray-600">
          Objetivo: verificar regras de negócio, validação de dados, respostas das APIs e comportamento de componentes.
          A suíte usa Vitest com jsdom; as rotas de API usam mocks para dependências como autenticação e Prisma.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr><th scope="col" className="p-3">Área</th><th scope="col" className="p-3">Casos</th><th scope="col" className="p-3">O que é verificado</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map((group) => (
                <tr key={group.area}>
                  <th scope="row" className="p-3 font-medium text-gray-900">{group.area}</th>
                  <td className="p-3 tabular-nums">{group.tests}</td>
                  <td className="p-3 text-gray-600">{group.examples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-sm text-gray-600">
          <strong>Procedimento:</strong> executar <code className="rounded bg-gray-100 px-1">npx vitest run</code>, registrar
          os resultados por arquivo e corrigir falhas antes de repetir a suíte. Critério de aceite desta rodada:
          todos os testes automatizados passam, sem falhas nem casos ignorados.
        </p>
      </section>

      <section aria-labelledby="resultados" className="space-y-5">
        <div>
          <h2 id="resultados" className="text-2xl font-semibold">Resultado da execução</h2>
          <p className="mt-2 text-gray-600">Execução final: 9 arquivos de teste, {total} casos executados.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Aprovados", value: passed, color: "text-emerald-700" },
            { label: "Falharam", value: failed, color: "text-gray-900" },
            { label: "Ignorados", value: 0, color: "text-gray-900" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className={`mt-2 text-4xl font-bold tabular-nums ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Na primeira execução, 10 testes de cadastro de anúncios falharam porque o mock não simulava a consulta
          de existência do usuário, adicionada à rota. O mock foi atualizado e a suíte inteira foi executada
          novamente: 290 aprovações e nenhuma falha. Isso não é evidência de teste ponta a ponta com banco real.
        </p>
      </section>

      <section aria-labelledby="metricas" className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 id="metricas" className="text-2xl font-semibold">Cálculo das métricas</h2>
        <dl className="mt-5 space-y-5 text-sm">
          <div><dt className="font-semibold text-gray-900">Taxa de aprovação</dt><dd className="mt-1 text-gray-600">Aprovados ÷ executados × 100 = {passed} ÷ {total} × 100 = <strong>100%</strong>.</dd></div>
          <div><dt className="font-semibold text-gray-900">Taxa de falha</dt><dd className="mt-1 text-gray-600">Falhas ÷ executados × 100 = {failed} ÷ {total} × 100 = <strong>0%</strong>.</dd></div>
          <div><dt className="font-semibold text-gray-900">Taxa de execução</dt><dd className="mt-1 text-gray-600">Executados ÷ planejados × 100 = {total} ÷ {total} × 100 = <strong>100%</strong> da suíte automatizada disponível nesta rodada.</dd></div>
        </dl>
        <p className="mt-6 border-t border-gray-100 pt-5 text-sm text-gray-500">
          A cobertura de linhas, ramos e funções não foi medida nesta execução; a taxa de aprovação não deve
          ser interpretada como cobertura do código. Testes manuais, de desempenho e de produção não estão
          incluídos nestas métricas.
        </p>
      </section>
    </div>
  );
}
