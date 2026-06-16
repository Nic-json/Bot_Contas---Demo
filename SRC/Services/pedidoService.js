const db = require("../config/database");

async function criarPedido({ usuarioId, usuarioNome, contaId, canalId }) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const contaResult = await client.query(
      `
      UPDATE contas_jogos
      SET status = 'RESERVADA'
      WHERE id = $1
        AND status = 'DISPONIVEL'
      RETURNING *;
      `,
      [contaId],
    );

    const conta = contaResult.rows[0];

    if (!conta) {
      await client.query("ROLLBACK");
      return null;
    }

    const pedidoResult = await client.query(
      `
      INSERT INTO pedidos (
        usuario_id,
        usuario_nome,
        conta_id,
        valor,
        status,
        canal_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
      `,
      [
        usuarioId,
        usuarioNome,
        conta.id,
        conta.valor,
        "AGUARDANDO_PAGAMENTO",
        canalId,
      ],
    );

    await client.query("COMMIT");

    return {
      id: pedidoResult.rows[0].id,
      conta,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function buscarPedido(pedidoId) {
  const result = await db.query(
    `
    SELECT *
    FROM pedidos
    WHERE id = $1;
    `,
    [pedidoId],
  );

  return result.rows[0];
}

async function confirmarPagamento(pedidoId) {
  const result = await db.query(
    `
    UPDATE pedidos
    SET status = 'ENTREGUE',
        atualizado_em = NOW()
    WHERE id = $1
      AND status = 'AGUARDANDO_PAGAMENTO'
    RETURNING *;
    `,
    [pedidoId],
  );

  return result.rows[0];
}

module.exports = {
  criarPedido,
  buscarPedido,
  confirmarPagamento,
};
