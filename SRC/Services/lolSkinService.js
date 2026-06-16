const IDIOMAS = ["en_US", "pt_BR"];
const LOTE_TAMANHO = 25;

let indiceSkins = null;
let carregandoIndice = null;

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function buscarVersaoAtual() {
  const resposta = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json",
  );
  const versoes = await resposta.json();

  return versoes[0];
}

async function buscarSkinsDoCampeao(versao, idioma, campeaoId) {
  const resposta = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${versao}/data/${idioma}/champion/${campeaoId}.json`,
  );

  if (!resposta.ok) {
    return [];
  }

  const dados = await resposta.json();
  const campeao = dados.data[campeaoId];

  return campeao.skins
    .filter((skin) => skin.num > 0)
    .map((skin) => ({
      nome: skin.name,
      splashUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${campeaoId}_${skin.num}.jpg`,
    }));
}

async function montarIndiceSkins() {
  const versao = await buscarVersaoAtual();
  const mapa = new Map();

  for (const idioma of IDIOMAS) {
    const resposta = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${versao}/data/${idioma}/champion.json`,
    );
    const { data: campeoes } = await resposta.json();
    const listaCampeoes = Object.values(campeoes);

    for (let i = 0; i < listaCampeoes.length; i += LOTE_TAMANHO) {
      const lote = listaCampeoes.slice(i, i + LOTE_TAMANHO);
      const resultados = await Promise.all(
        lote.map((campeao) => buscarSkinsDoCampeao(versao, idioma, campeao.id)),
      );

      for (const skins of resultados) {
        for (const skin of skins) {
          const chave = normalizar(skin.nome);

          if (!mapa.has(chave)) {
            mapa.set(chave, skin);
          }
        }
      }
    }
  }

  return mapa;
}

async function garantirIndice() {
  if (indiceSkins) {
    return indiceSkins;
  }

  if (!carregandoIndice) {
    carregandoIndice = montarIndiceSkins()
      .then((indice) => {
        indiceSkins = indice;
        console.log(`Índice de skins LoL carregado (${indice.size} skins).`);
        return indice;
      })
      .catch((erro) => {
        carregandoIndice = null;
        throw erro;
      });
  }

  return carregandoIndice;
}

function encontrarSkinNoIndice(indice, nomeSkin) {
  const termo = normalizar(nomeSkin);

  if (!termo) {
    return null;
  }

  const exata = indice.get(termo);

  if (exata) {
    return exata;
  }

  let melhor = null;

  for (const [chave, skin] of indice.entries()) {
    if (chave.includes(termo) || termo.includes(chave)) {
      if (!melhor || chave.length > normalizar(melhor.nome).length) {
        melhor = skin;
      }
    }
  }

  return melhor;
}

async function buscarSkin(nomeSkin) {
  if (!nomeSkin) {
    return null;
  }

  try {
    const indice = await garantirIndice();
    return encontrarSkinNoIndice(indice, nomeSkin);
  } catch (erro) {
    console.error("Erro ao buscar skin no Data Dragon:", erro);
    return null;
  }
}

async function preload() {
  await garantirIndice();
}

module.exports = {
  buscarSkin,
  preload,
};
