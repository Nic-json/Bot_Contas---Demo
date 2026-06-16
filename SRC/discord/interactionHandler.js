const { Events } = require("discord.js");

const compraController = require("../Controller/CompraController");
const contaController = require("../Controller/ContaController");

async function responderErro(interaction) {
  const resposta = {
    content: "Ocorreu um erro ao processar essa acao.",
    ephemeral: true,
  };

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(resposta);
    return;
  }

  await interaction.reply(resposta);
}

function configurarInteractionHandler(client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        if (interaction.commandName === "comprar") {
          await compraController.abrirLoja(interaction);
        }

        if (interaction.commandName === "cadastrar-conta") {
          await contaController.cadastrarConta(interaction);
        }
      }

      if (interaction.isStringSelectMenu()) {
        if (interaction.customId === "selecionar_conta") {
          await compraController.selecionarConta(interaction);
        }
      }

      if (interaction.isButton()) {
        if (interaction.customId.startsWith("comprar_conta_")) {
          await compraController.comprarConta(interaction, client);
        }

        if (interaction.customId.startsWith("confirmar_pagamento_")) {
          await compraController.confirmarPagamento(interaction);
        }
      }
    } catch (error) {
      console.error("Erro na interacao:", error);
      await responderErro(interaction);
    }
  });
}

module.exports = {
  configurarInteractionHandler,
};
