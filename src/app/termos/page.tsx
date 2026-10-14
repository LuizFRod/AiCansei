export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
        <p className="mt-2 text-sm text-gray-400">Última atualização: Agosto de 2026</p>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">1. Aceitação dos Termos</h2>
        <p className="text-gray-600 leading-relaxed">
          Ao acessar e utilizar o AiCansei, você concorda com estes Termos de Uso. Se não concordar com algum dos termos, não utilize a plataforma.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">2. Descrição do Serviço</h2>
        <p className="text-gray-600 leading-relaxed">
          O AiCansei é uma plataforma online que conecta doadores e receptores de itens usados. Os usuários podem anunciar itens para doação, manifestar interesse em itens anunciados e avaliar experiências de doação.
        </p>
        <p className="text-gray-600 leading-relaxed">
          O serviço é gratuito para todos os usuários.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">3. Cadastro e Conta</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Para utilizar o AiCansei, é necessário criar uma conta com dados verdadeiros.</li>
          <li>O usuário é responsável por manter a confidencialidade de sua senha.</li>
          <li>Cada pessoa deve possuir apenas uma conta na plataforma.</li>
          <li>O usuário pode solicitar a exclusão de sua conta a qualquer momento.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">4. Anúncios e Doações</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Os anúncios são revisados pela equipe antes de ficarem visíveis publicamente.</li>
          <li>É proibido anunciar itens ilegais, perigosos ou que violem direitos de terceiros.</li>
          <li>O doador é responsável pela veracidade das informações do item anunciado.</li>
          <li>A combinação de entrega ou retirada é de responsabilidade das partes envolvidas.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">5. Avaliações</h2>
        <p className="text-gray-600 leading-relaxed">
          As avaliações são fundamentadas na experiência real de doação. Avaliações falsas, ofensivas ou que não reflitam a experiência real poderão ser removidas pela equipe de moderação.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">6. Responsabilidades</h2>
        <p className="text-gray-600 leading-relaxed">
          O AiCansei atua apenas como intermediário entre doadores e receptores. Não nos responsabilizamos pela qualidade dos itens doados, pela segurança nas entregas ou por quaisquer acordos feitos entre os usuários fora da plataforma.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">7. Privacidade</h2>
        <p className="text-gray-600 leading-relaxed">
          Os dados pessoais dos usuários são tratados de acordo com a Lei Geral de Proteção de Dados (LGPD). Não compartilhamos informações pessoais com terceiros sem o consentimento do usuário, exceto quando exigido por lei.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">8. Modificação dos Termos</h2>
        <p className="text-gray-600 leading-relaxed">
          O AiCansei reserva-se o direito de alterar estes Termos de Uso a qualquer momento. Os usuários serão notificados sobre alterações significativas. O uso contínuo da plataforma após as alterações constitui aceitação dos novos termos.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">9. Contato</h2>
        <p className="text-gray-600 leading-relaxed">
          Em caso de dúvidas sobre estes termos, entre em contato conosco pelo email{" "}
          <a href="mailto:10723667@mackenzista.com.br" className="text-emerald-600 hover:text-emerald-700 font-medium">
            10723667@mackenzista.com.br
          </a>.
        </p>
      </section>
    </div>
  );
}
