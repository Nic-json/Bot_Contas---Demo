require("dotenv").config();

const client = require("./discord/client");
const { validarEnv } = require("./config/env");
const { configurarInteractionHandler } = require("./discord/interactionHandler");
const { configurarReadyHandler } = require("./discord/readyHandler");
const { registrarComandos } = require("./discord/registerCommands");
const { iniciarHealthcheck } = require("./server/healthcheck");

async function main() {
  validarEnv();

  configurarReadyHandler(client);
  configurarInteractionHandler(client);

  await registrarComandos();
  await client.login(process.env.DISCORD_TOKEN);

  iniciarHealthcheck();
}

main().catch((error) => {
  console.error("Erro ao iniciar o bot:", error);
  process.exit(1);
});
