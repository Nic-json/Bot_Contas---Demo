const { EmbedBuilder } = require("discord.js");

const contaService = require("../Services/contaService");
const lolSkinService = require("../Services/lolSkinService");
const { usuarioEhAdmin } = require("../permissions/roles");
const {
  isLeagueOfLegends,
  montarNomeExibicao,
} = require("../utils/contaDisplay");

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function cadastrarConta(interaction) {
  if (!usuarioEhAdmin(interaction)) {
    return interaction.reply({
      content: "Voce nao tem permissao para cadastrar contas.",
      ephemeral: true,
    });
  }

  const jogo = interaction.options.getString("jogo", true);
  const servidor = interaction.options.getString("servidor", true);
  const valor = interaction.options.getNumber("valor", true);
  const login = interaction.options.getString("login", true);
  const senha = interaction.options.getString("senha", true);
  const elo = interaction.options.getString("elo");
  const nivel = interaction.options.getInteger("nivel");
  const skinMaisValiosa = interaction.options.getString("skin_mais_valiosa");
  const quantidadeSkins = interaction.options.getInteger("quantidade_skins");
  const quantidadeCampeoes = interaction.options.getInteger("quantidade_campeoes");
  const observacao = interaction.options.getString("observacao");

  const contaId = await contaService.cadastrarConta({
    jogo,
    servidor,
    valor,
    login,
    senha,
    elo,
    nivel,
    skinMaisValiosa,
    quantidadeSkins,
    quantidadeCampeoes,
    observacao,
  });

  const embed = new EmbedBuilder()
    .setTitle(
      montarNomeExibicao({
        jogo,
        servidor,
        elo,
        skin_mais_valiosa: skinMaisValiosa,
      }),
    )
    .setDescription(`Conta #${contaId} cadastrada e disponivel na loja.`)
    .addFields(
      { name: "Jogo", value: jogo },
      { name: "Servidor", value: servidor },
      { name: "Valor", value: formatarPreco(valor) },
      { name: "Login", value: login },
      { name: "Nivel", value: nivel?.toString() || "Nao informado" },
      {
        name: "Skins",
        value: quantidadeSkins?.toString() || "Nao informado",
      },
      {
        name: "Campeoes",
        value: quantidadeCampeoes?.toString() || "Nao informado",
      },
    );

  if (skinMaisValiosa) {
    embed.addFields({
      name: "Skin em destaque",
      value: skinMaisValiosa,
    });
  }

  if (isLeagueOfLegends(jogo) && skinMaisValiosa) {
    const skin = await lolSkinService.buscarSkin(skinMaisValiosa);

    if (skin) {
      embed.setImage(skin.splashUrl);
    }
  }

  if (observacao) {
    embed.addFields({ name: "Observacoes", value: observacao });
  }

  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}

module.exports = {
  cadastrarConta,
};
