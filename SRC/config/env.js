const variaveisObrigatorias = [
  "DISCORD_TOKEN",
  "CLIENT_ID",
  "GUILD_ID",
  "DATABASE_URL",
  "ADMIN_ROLE_ID",
];

function validarEnv() {
  const variaveisAusentes = variaveisObrigatorias.filter(
    (nome) => !process.env[nome],
  );

  if (variaveisAusentes.length) {
    throw new Error(
      `Variaveis de ambiente ausentes: ${variaveisAusentes.join(", ")}`,
    );
  }
}

module.exports = {
  validarEnv,
};
