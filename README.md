# DiscordBotVendas Demo

Demo tecnica de um bot de vendas para Discord usando Node.js, discord.js e PostgreSQL. O objetivo deste repositorio e mostrar a arquitetura, o fluxo basico de venda, o uso de slash commands, componentes interativos, migrations e separacao de responsabilidades.

> Esta e uma versao demonstrativa. A versao comercial/Pro pode incluir Pix com QR Code, filtros avancados, canais por jogo, cancelamento automatico, logs administrativos, painel fixo de loja, webhook de pagamento e criptografia de credenciais.

## Funcionalidades Da Demo

- Comando `/comprar` para abrir a loja.
- Comando `/cadastrar-conta` para administradores cadastrarem estoque.
- Select menu para o cliente escolher uma conta.
- Criacao de canal privado para cada pedido.
- Confirmacao manual de pagamento por administrador.
- Entrega de login e senha apos confirmacao.
- Persistencia em PostgreSQL.
- Migrations SQL com manifest.
- Estrutura organizada por config, discord, controllers, services e permissions.

## Fluxo Do Cliente

1. O cliente usa `/comprar`.
2. O bot mostra as contas disponiveis.
3. O cliente escolhe uma conta no select menu.
4. O bot mostra detalhes da conta escolhida.
5. O cliente clica em `Comprar conta selecionada`.
6. O bot cria um canal privado de pedido.
7. O cliente envia comprovante ou combina pagamento manualmente.
8. Um administrador confirma o pagamento.
9. O bot entrega login e senha no canal privado.

## Fluxo Do Administrador

O administrador precisa ter o cargo configurado em `ADMIN_ROLE_ID`.

### Cadastrar Conta

Use:

```text
/cadastrar-conta
```

Campos:

- `jogo`
- `servidor`
- `valor`
- `login`
- `senha`
- `elo`
- `nivel`
- `skin_mais_valiosa`
- `quantidade_skins`
- `quantidade_campeoes`
- `observacao`

### Confirmar Pagamento

No canal privado do pedido, o administrador clica em:

```text
Confirmar pagamento e liberar conta
```

Depois disso:

- o pedido vira `ENTREGUE`;
- a conta vira `VENDIDA`;
- o bot envia as credenciais para o cliente.

## Variaveis De Ambiente

Crie um arquivo `.env` localmente ou configure estas variaveis na hospedagem.

```env
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
DATABASE_URL=
PORT=3000
ADMIN_ROLE_ID=
CUSTOMER_ROLE_ID=
```

`DISCORD_TOKEN`: token do bot no Discord Developer Portal.

`CLIENT_ID`: ID da aplicacao do bot.

`GUILD_ID`: ID do servidor onde os slash commands serao registrados.

`DATABASE_URL`: URL de conexao do PostgreSQL.

`PORT`: porta do healthcheck HTTP.

`ADMIN_ROLE_ID`: cargo que pode cadastrar contas e confirmar pagamento.

`CUSTOMER_ROLE_ID`: opcional. Se preenchido, apenas esse cargo pode comprar. Se vazio, qualquer membro pode comprar.

## Como Rodar

Instale dependencias:

```bash
npm install
```

Rode migrations:

```bash
npm run db:migrate
```

Inicie o bot:

```bash
npm start
```

## Banco De Dados

O projeto usa PostgreSQL.

Tabelas principais:

- `contas_jogos`
- `pedidos`
- `schema_migrations`

Status de contas:

- `DISPONIVEL`
- `RESERVADA`
- `VENDIDA`

Status de pedidos:

- `AGUARDANDO_PAGAMENTO`
- `ENTREGUE`

## Migrations

As migrations ficam em:

```text
migrations/
```

O manifest fica em:

```text
migrations/manifest.js
```

Exemplo:

```js
module.exports = [
  {
    version: "1.0.0",
    description: "Criar tabelas iniciais de contas e pedidos",
    type: "schema",
    file: "001_create_initial_tables.sql",
  },
];
```

O executor fica em:

```text
scripts/migrateDatabase.js
```

Rodar migrations:

```bash
npm run db:migrate
```

## Estrutura Do Codigo

```text
SRC/
  config/
  Controller/
  discord/
  permissions/
  server/
  Services/
  utils/

migrations/
scripts/
```

### config

- `env.js`: valida variaveis obrigatorias.
- `database.js`: cria conexao com PostgreSQL.

### discord

- `client.js`: cria o client do Discord.
- `commands.js`: define os slash commands.
- `registerCommands.js`: registra comandos no servidor.
- `interactionHandler.js`: roteia comandos, botoes e selects.
- `readyHandler.js`: logica quando o bot fica online.

### Controller

- `CompraController.js`: fluxo de compra e entrega.
- `ContaController.js`: cadastro de contas.

### Services

- `contaService.js`: operacoes de estoque.
- `pedidoService.js`: criacao e confirmacao de pedidos.
- `lolSkinService.js`: busca imagens de skins de League of Legends.

### permissions

- `roles.js`: verifica cargo admin e cargo de comprador.

### server

- `healthcheck.js`: servidor HTTP simples para hospedagens como Render.

## Versao Comercial / Pro

Este repositorio mostra a base tecnica. Uma versao comercial pode incluir:

- Pix com QR Code e copia e cola.
- Integracao automatica com gateway de pagamento.
- Painel fixo de loja por canal.
- Canais por jogo.
- Filtros por preco, categoria, elo ou servidor.
- Cancelamento automatico de pedidos.
- Logs administrativos detalhados.
- Exclusao automatica de canais sensiveis.
- Criptografia de login e senha no banco.
- Painel web administrativo.
- Instalacao, hospedagem e suporte.

## Observacoes De Seguranca

- Nunca versione `.env`.
- Use `.env.example` apenas como modelo.
- Configure corretamente `ADMIN_ROLE_ID`.
- Em producao, criptografe login e senha antes de salvar no banco.
- Em producao, prefira confirmacao automatica por webhook de pagamento.
