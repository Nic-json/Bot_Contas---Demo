function isLeagueOfLegends(jogo) {
  const normalizado = jogo.toLowerCase();

  return (
    normalizado.includes("league") ||
    normalizado.includes("lol") ||
    normalizado.includes("legends")
  );
}

function montarNomeExibicao(conta) {
  let nome = "Conta";

  if (conta.elo) {
    nome += ` ${conta.elo}`;
  }

  if (conta.skin_mais_valiosa) {
    nome += ` (${conta.skin_mais_valiosa})`;
  }

  if (nome === "Conta") {
    return `${conta.jogo} - ${conta.servidor}`;
  }

  return nome;
}

module.exports = {
  isLeagueOfLegends,
  montarNomeExibicao,
};
