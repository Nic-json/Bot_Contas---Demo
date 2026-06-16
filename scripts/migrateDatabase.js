require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");

const db = require("../SRC/config/database");
const migrations = require("../migrations/manifest");

const migrationsDir = path.join(__dirname, "..", "migrations");

async function criarTabelaDeControle(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(50) PRIMARY KEY,
      description TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      file VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function buscarVersoesExecutadas(client) {
  const result = await client.query(`
    SELECT version
    FROM schema_migrations;
  `);

  return new Set(result.rows.map((row) => row.version));
}

async function rodarMigration(client, migration) {
  const sqlPath = path.join(migrationsDir, migration.file);
  const sql = await fs.readFile(sqlPath, "utf8");

  console.log(`Executando ${migration.version}: ${migration.description}`);

  await client.query("BEGIN");

  try {
    await client.query(sql);
    await client.query(
      `
      INSERT INTO schema_migrations (version, description, type, file)
      VALUES ($1, $2, $3, $4);
      `,
      [
        migration.version,
        migration.description,
        migration.type,
        migration.file,
      ],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function rodarMigrations() {
  const client = await db.connect();

  try {
    await criarTabelaDeControle(client);

    const executadas = await buscarVersoesExecutadas(client);

    for (const migration of migrations) {
      if (executadas.has(migration.version)) {
        console.log(`Pulando ${migration.version}, ja executada.`);
        continue;
      }

      await rodarMigration(client, migration);
    }

    console.log("Migrations finalizadas.");
  } finally {
    client.release();
    await db.end();
  }
}

rodarMigrations().catch((error) => {
  console.error("Erro ao rodar migrations:", error);
  process.exit(1);
});
