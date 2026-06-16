const { REST, Routes } = require("discord.js");

const commands = require("./commands");

async function registrarComandos() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID,
    ),
    { body: commands },
  );

  console.log("Comandos registrados.");
}

module.exports = {
  registrarComandos,
};
