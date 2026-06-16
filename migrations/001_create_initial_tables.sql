CREATE TABLE IF NOT EXISTS contas_jogos (
  id SERIAL PRIMARY KEY,

  jogo VARCHAR(100) NOT NULL,
  servidor VARCHAR(50) NOT NULL,

  elo VARCHAR(100),
  nivel INTEGER,

  skin_mais_valiosa VARCHAR(200),

  valor NUMERIC(10, 2) NOT NULL,

  login VARCHAR(200) NOT NULL,
  senha VARCHAR(200) NOT NULL,

  quantidade_skins INTEGER,
  quantidade_campeoes INTEGER,

  observacao TEXT,

  status VARCHAR(30) DEFAULT 'DISPONIVEL',

  criado_em TIMESTAMP DEFAULT NOW(),
  vendido_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,

  usuario_id VARCHAR(50) NOT NULL,
  usuario_nome VARCHAR(100) NOT NULL,

  conta_id INTEGER REFERENCES contas_jogos(id),

  valor NUMERIC(10, 2) NOT NULL,

  status VARCHAR(50) DEFAULT 'AGUARDANDO_PAGAMENTO',

  canal_id VARCHAR(50),

  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
