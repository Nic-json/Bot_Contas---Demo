function membroTemCargo(interaction, roleId) {
  if (!roleId) {
    return false;
  }

  return interaction.member?.roles?.cache?.has(roleId) || false;
}

function usuarioEhAdmin(interaction) {
  return membroTemCargo(interaction, process.env.ADMIN_ROLE_ID);
}

function usuarioPodeComprar(interaction) {
  if (!process.env.CUSTOMER_ROLE_ID) {
    return true;
  }

  return membroTemCargo(interaction, process.env.CUSTOMER_ROLE_ID)
    || usuarioEhAdmin(interaction);
}

module.exports = {
  usuarioEhAdmin,
  usuarioPodeComprar,
};
