#!/bin/bash
# Fix missing Portuguese accents in all source files

find /Users/felipe/aicansai/src -name '*.tsx' -o -name '*.ts' | while IFS= read -r f; do
  # Core replacements
  sed -i '' \
    -e 's/Nao /Não /g' \
    -e 's/nao /não /g' \
    -e 's/entao /então /g' \
    -e 's/entao,/então,/g' \
    -e 's/voce /você /g' \
    -e 's/voce./você./g' \
    -e 's/voce,/você,/g' \
    -e 's/voce"/você"/g' \
    -e 's/localizacao /localização /g' \
    -e 's/localizacao,/localização,/g' \
    -e 's/localizacao"/localização"/g' \
    -e 's/informacoes /informações /g' \
    -e 's/informacoes,/informações,/g' \
    -e 's/usuario /usuário /g' \
    -e 's/usuario,/usuário,/g' \
    -e 's/usuario"/usuário"/g' \
    -e 's/usuarios /usuários /g' \
    -e 's/usuarios,/usuários,/g' \
    -e 's/anuncio /anúncio /g' \
    -e 's/anuncio,/anúncio,/g' \
    -e 's/anuncio"/anúncio"/g' \
    -e 's/anuncios /anúncios /g' \
    -e 's/anuncios,/anúncios,/g' \
    -e 's/disponivel /disponível /g' \
    -e 's/disponivel,/disponível,/g' \
    -e 's/disponivel"/disponível"/g' \
    -e 's/avaliacao /avaliação /g' \
    -e 's/avaliacao,/avaliação,/g' \
    -e 's/avaliacao"/avaliação"/g' \
    -e 's/avaliacoes /avaliações /g' \
    -e 's/avaliacoes,/avaliações,/g' \
    -e 's/endereco /endereço /g' \
    -e 's/endereco,/endereço,/g' \
    -e 's/endereco"/endereço"/g' \
    -e 's/confirmacao /confirmação /g' \
    -e 's/confirmacao,/confirmação,/g' \
    -e 's/exclusao /exclusão /g' \
    -e 's/exclusao,/exclusão,/g' \
    -e 's/denuncia /denúncia /g' \
    -e 's/denuncia,/denúncia,/g' \
    -e 's/configuracoes /configurações /g' \
    -e 's/comentario /comentário /g' \
    -e 's/comentarios /comentários /g' \
    -e 's/doacao /doação /g' \
    -e 's/doacao,/doação,/g' \
    -e 's/doacao"/doação"/g' \
    -e 's/doacoes /doações /g' \
    -e 's/rapido /rápido /g' \
    -e 's/rapido,/rápido,/g' \
    -e 's/incriveis /incríveis /g' \
    -e 's/alguem /alguém /g' \
    -e 's/descricao /descrição /g' \
    -e 's/descricao,/descrição,/g' \
    -e 's/descricao"/descrição"/g' \
    -e 's/seguranca /segurança /g' \
    -e 's/politica /política /g' \
    -e 's/responsavel /responsável /g' \
    -e 's/necessario /necessário /g' \
    -e 's/possivel /possível /g' \
    -e 's/praticas /práticas /g' \
    -e 's/concluido /concluído /g' \
    -e 's/publico /público /g' \
    -e 's/obrigatorio /obrigatório /g' \
    -e 's/valido /válido /g' \
    -e 's/invalido /inválido /g' \
    -e 's/estatisticas /estatísticas /g' \
    -e 's/estatistica /estatística /g' \
    -e 's/contribuicao /contribuição /g' \
    -e 's/combinacao /combinação /g' \
    -e 's/decisao /decisão /g' \
    -e 's/operao /operação /g' \
    -e 's/autenticacao /autenticação /g' \
    -e 's/autorizacao /autorização /g' \
    -e 's/identificacao /identificação /g' \
    -e 's/conexao /conexão /g' \
    -e 's/permissao /permissão /g' \
    -e 's/permissoes /permissões /g' \
    -e 's/proibicao /proibição /g' \
    -e 's/liberacao /liberação /g' \
    -e 's/habilitacao /habilitação /g' \
    -e 's/desabilitacao /desabilitação /g' \
    -e 's/ativacao /ativação /g' \
    -e 's/desativacao /desativação /g' \
    "$f"
done

echo "Done fixing accents!"
