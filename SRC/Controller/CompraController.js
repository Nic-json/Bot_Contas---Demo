const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
} = require("discord.js");

const contaService = require("../Services/contaService");
const pedidoService = require("../Services/pedidoService");
const lolSkinService = require("../Services/lolSkinService");
const {
  usuarioEhAdmin,
  usuarioPodeComprar,
} = require("../permissions/roles");
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

async function montarCardConta(conta, indice, total) {
  const embed = new EmbedBuilder()
    .setTitle(montarNomeExibicao(conta))
    .setDescription(`${conta.jogo} - ${conta.servidor} | ${indice + 1} de ${total}`)
    .addFields(
      { name: "Valor", value: formatarPreco(conta.valor), inline: true },
      { name: "Elo", value: conta.elo || "Nao informado", inline: true },
      {
        name: "Nivel",
        value: conta.nivel?.toString() || "Nao informado",
        inline: true,
      },
      {
        name: "Skins",
        value: conta.quantidade_skins?.toString() || "Nao informado",
        inline: true,
      },
      {
        name: "Campeoes",
        value: conta.quantidade_campeoes?.toString() || "Nao informado",
        inline: true,
      },
    );

  if (conta.skin_mais_valiosa) {
    embed.addFields({
      name: "Skin em destaque",
      value: conta.skin_mais_valiosa,
    });
  }

  if (isLeagueOfLegends(conta.jogo) && conta.skin_mais_valiosa) {
    const skin = await lolSkinService.buscarSkin(conta.skin_mais_valiosa);

    if (skin) {
      embed.setImage(skin.splashUrl);
    }
  }

  if (conta.observacao) {
    embed.addFields({ name: "Observacoes", value: conta.observacao });
  }

  return embed;
}

function limitarTexto(texto, limite) {
  const valor = String(texto || "");

  if (valor.length <= limite) {
    return valor;
  }

  return `${valor.slice(0, limite - 3)}...`;
}

function montarMenuContas(contas, contaSelecionadaId) {
  const opcoes = contas.slice(0, 25).map((conta) => ({
    label: limitarTexto(montarNomeExibicao(conta), 100),
    description: limitarTexto(`${formatarPreco(conta.valor)} | ${conta.servidor}`, 100),
    value: String(conta.id),
    default: String(conta.id) === String(contaSelecionadaId),
  }));

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("selecionar_conta")
      .setPlaceholder("Selecione uma conta")
      .addOptions(opcoes),
  );
}

function montarBotaoCompra(conta) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`comprar_conta_${conta.id}`)
      .setLabel("Comprar conta selecionada")
      .setStyle(ButtonStyle.Success),
  );
}

function montarCardLoja(contas) {
  const linhas = contas.slice(0, 10).map((conta) => {
    const destaque = conta.elo || conta.skin_mais_valiosa || conta.servidor;
    return `- ${montarNomeExibicao(conta)} | ${formatarPreco(conta.valor)} | ${destaque}`;
  });

  const rodape = contas.length > 25
    ? "\n\nDemo: mostrando as primeiras 25 contas no seletor."
    : "";

  return new EmbedBuilder()
    .setTitle("Contas disponiveis")
    .setDescription(`${linhas.join("\n")}${rodape}`);
}

async function abrirLoja(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!usuarioPodeComprar(interaction)) {
    return interaction.editReply({
      content: "Voce nao tem permissao para comprar contas nesta loja.",
    });
  }

  const contas = await contaService.buscarContasDisponiveis();

  if (!contas.length) {
    return interaction.editReply({
      content: "Nenhuma conta disponivel no momento.",
    });
  }

  await interaction.editReply({
    embeds: [montarCardLoja(contas)],
    components: [montarMenuContas(contas)],
  });
}

async function selecionarConta(interaction) {
  await interaction.deferUpdate();

  const contas = await contaService.buscarContasDisponiveis();

  if (!contas.length) {
    return interaction.editReply({
      content: "Nenhuma conta disponivel no momento.",
      embeds: [],
      components: [],
    });
  }

  const contaId = interaction.values[0];
  const indice = contas.findIndex((conta) => String(conta.id) === contaId);

  if (indice === -1) {
    return interaction.editReply({
      content: "Essa conta nao esta mais disponivel.",
      embeds: [montarCardLoja(contas)],
      components: [montarMenuContas(contas)],
    });
  }

  const conta = contas[indice];

  await interaction.editReply({
    content: null,
    embeds: [await montarCardConta(conta, indice, contas.length)],
    components: [
      montarMenuContas(contas, conta.id),
      montarBotaoCompra(conta),
    ],
  });
}

async function comprarConta(interaction, client) {
  await interaction.deferReply({ ephemeral: true });

  if (!usuarioPodeComprar(interaction)) {
    return interaction.editReply({
      content: "Voce nao tem permissao para comprar contas nesta loja.",
    });
  }

  const contaId = interaction.customId.replace("comprar_conta_", "");
  const conta = await contaService.buscarContaDisponivel(contaId);

  if (!conta) {
    return interaction.editReply({
      content: "Conta nao encontrada ou indisponivel.",
    });
  }

  const guild = interaction.guild;

  const canal = await guild.channels.create({
    name: `pedido-${interaction.user.username}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: process.env.ADMIN_ROLE_ID,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels,
        ],
      },
    ],
  });

  const pedido = await pedidoService.criarPedido({
    usuarioId: interaction.user.id,
    usuarioNome: interaction.user.tag,
    contaId: conta.id,
    canalId: canal.id,
  });

  if (!pedido) {
    await canal.delete("Pedido cancelado: conta indisponivel.").catch(() => {});

    return interaction.editReply({
      content: "Essa conta acabou de ficar indisponivel. Abra a loja novamente.",
    });
  }

  const pedidoId = pedido.id;
  const contaReservada = pedido.conta;

  const embedPedido = new EmbedBuilder()
    .setTitle(`Novo pedido #${pedidoId}`)
    .setDescription(
      "Envie o comprovante de pagamento neste canal e aguarde um administrador confirmar.",
    )
    .addFields(
      { name: "Cliente", value: interaction.user.tag },
      { name: "Jogo", value: contaReservada.jogo },
      { name: "Servidor", value: contaReservada.servidor },
      { name: "Elo", value: contaReservada.elo || "Nao informado" },
      {
        name: "Skin mais valiosa",
        value: contaReservada.skin_mais_valiosa || "Nao informada",
      },
      { name: "Valor", value: formatarPreco(contaReservada.valor) },
      { name: "Status", value: "Aguardando pagamento" },
    );

  const rowAdmin = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`confirmar_pagamento_${pedidoId}`)
      .setLabel("Confirmar pagamento e liberar conta")
      .setStyle(ButtonStyle.Success),
  );

  await canal.send({
    content: `${interaction.user}`,
    embeds: [embedPedido],
    components: [rowAdmin],
  });

  await interaction.editReply({
    content: `Pedido #${pedidoId} criado: ${canal}`,
  });
}

async function confirmarPagamento(interaction) {
  if (!usuarioEhAdmin(interaction)) {
    return interaction.reply({
      content: "Voce nao tem permissao para confirmar pagamentos.",
      ephemeral: true,
    });
  }

  await interaction.deferUpdate();

  const pedidoId = interaction.customId.replace("confirmar_pagamento_", "");
  const pedido = await pedidoService.confirmarPagamento(pedidoId);

  if (!pedido) {
    const pedidoExistente = await pedidoService.buscarPedido(pedidoId);

    if (!pedidoExistente) {
      return interaction.followUp({
        content: "Pedido nao encontrado.",
        ephemeral: true,
      });
    }

    return interaction.followUp({
      content: "Este pedido ja foi confirmado e entregue.",
      ephemeral: true,
    });
  }

  await contaService.marcarComoVendida(pedido.conta_id);

  const conta = await contaService.buscarContaPorId(pedido.conta_id);

  if (!conta) {
    return interaction.followUp({
      content: "Conta do pedido nao encontrada. Verifique o banco de dados.",
      ephemeral: true,
    });
  }

  const embedConfirmado = new EmbedBuilder()
    .setTitle(`Pedido #${pedidoId} - Entregue`)
    .setDescription("Pagamento confirmado. As credenciais foram enviadas abaixo.");

  const rowFinalizado = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`pagamento_confirmado_${pedidoId}`)
      .setLabel("Pedido entregue")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
  );

  await interaction.editReply({
    embeds: [embedConfirmado],
    components: [rowFinalizado],
  });

  const embedEntrega = new EmbedBuilder()
    .setTitle(`Conta entregue - Pedido #${pedidoId}`)
    .setDescription(
      `<@${pedido.usuario_id}>, aqui estao os dados da sua conta.\n`
        + "Recomendamos trocar a senha assim que possivel.",
    )
    .addFields(
      { name: "Jogo", value: conta.jogo },
      { name: "Servidor", value: conta.servidor },
      { name: "Login", value: conta.login },
      { name: "Senha", value: conta.senha },
    );

  if (conta.observacao) {
    embedEntrega.addFields({
      name: "Observacoes",
      value: conta.observacao,
    });
  }

  await interaction.channel.send({ embeds: [embedEntrega] });
}

module.exports = {
  abrirLoja,
  selecionarConta,
  comprarConta,
  confirmarPagamento,
};
