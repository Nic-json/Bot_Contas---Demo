const db = require("../config/database");

async function buscarContasDisponiveis() {
  const result = await db.query(`
    SELECT
      id,
      jogo,
      servidor,
      elo,
      nivel,
      skin_mais_valiosa,
      valor,
      quantidade_skins,
      quantidade_campeoes,
      observacao
    FROM contas_jogos
    WHERE status = 'DISPONIVEL'
    ORDER BY id;
  `);

  return result.rows;
}

async function buscarContaDisponivel(contaId) {
  const result = await db.query(
    `
    SELECT *
    FROM contas_jogos
    WHERE id = $1
      AND status = 'DISPONIVEL';
    `,
    [contaId],
  );

  return result.rows[0];
}

async function buscarContaPorId(contaId) {
  const result = await db.query(
    `
    SELECT
      id,
      jogo,
      servidor,
      login,
      senha,
      observacao
    FROM contas_jogos
    WHERE id = $1;
    `,
    [contaId],
  );

  return result.rows[0];
}

async function cadastrarConta({
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
}) {
  const result = await db.query(
    `
    INSERT INTO contas_jogos (
      jogo,
      servidor,
      elo,
      nivel,
      skin_mais_valiosa,
      valor,
      login,
      senha,
      quantidade_skins,
      quantidade_campeoes,
      observacao
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id;
    `,
    [
      jogo,
      servidor,
      elo,
      nivel,
      skinMaisValiosa,
      valor,
      login,
      senha,
      quantidadeSkins,
      quantidadeCampeoes,
      observacao,
    ],
  );

  return result.rows[0].id;
}

async function marcarComoVendida(contaId) {
  await db.query(
    `
    UPDATE contas_jogos
    SET status = 'VENDIDA',
        vendido_em = NOW()
    WHERE id = $1;
    `,
    [contaId],
  );
}

module.exports = {
  buscarContasDisponiveis,
  buscarContaDisponivel,
  buscarContaPorId,
  cadastrarConta,
  marcarComoVendida,
};
