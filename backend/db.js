const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Create backend/.env using .env.example.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon requires TLS. The connection string normally includes sslmode=require.
  ssl: { rejectUnauthorized: false }
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Neon PostgreSQL connected; users table is ready.");
}

module.exports = { pool, initializeDatabase };
