const { Events } = require("discord.js");

const lolSkinService = require("../Services/lolSkinService");

function configurarReadyHandler(client) {
  client.once(Events.ClientReady, () => {
    console.log(`Bot online como ${client.user.tag}`);

    lolSkinService.preload().catch((error) => {
      console.error("Erro ao pre-carregar skins LoL:", error);
    });
  });
}

module.exports = {
  configurarReadyHandler,
};
