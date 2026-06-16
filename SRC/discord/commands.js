const { SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("comprar")
    .setDescription("Abrir a loja")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("cadastrar-conta")
    .setDescription("Cadastrar uma conta na loja (admin)")
    .addStringOption((option) =>
      option
        .setName("jogo")
        .setDescription("Nome do jogo")
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(100),
    )
    .addStringOption((option) =>
      option
        .setName("servidor")
        .setDescription("Servidor da conta")
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(50),
    )
    .addNumberOption((option) =>
      option
        .setName("valor")
        .setDescription("Preco em reais")
        .setRequired(true)
        .setMinValue(0.01)
        .setMaxValue(100000),
    )
    .addStringOption((option) =>
      option
        .setName("login")
        .setDescription("Login da conta")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(200),
    )
    .addStringOption((option) =>
      option
        .setName("senha")
        .setDescription("Senha da conta")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(200),
    )
    .addStringOption((option) =>
      option
        .setName("elo")
        .setDescription("Elo da conta")
        .setMinLength(1)
        .setMaxLength(100),
    )
    .addIntegerOption((option) =>
      option
        .setName("nivel")
        .setDescription("Nivel da conta")
        .setMinValue(0)
        .setMaxValue(1000),
    )
    .addStringOption((option) =>
      option
        .setName("skin_mais_valiosa")
        .setDescription("Skin mais valiosa")
        .setMinLength(1)
        .setMaxLength(200),
    )
    .addIntegerOption((option) =>
      option
        .setName("quantidade_skins")
        .setDescription("Quantidade de skins")
        .setMinValue(0)
        .setMaxValue(2000),
    )
    .addIntegerOption((option) =>
      option
        .setName("quantidade_campeoes")
        .setDescription("Quantidade de campeoes")
        .setMinValue(0)
        .setMaxValue(1000),
    )
    .addStringOption((option) =>
      option
        .setName("observacao")
        .setDescription("Observacoes extras")
        .setMinLength(1)
        .setMaxLength(1000),
    )
    .toJSON(),
];

module.exports = commands;
