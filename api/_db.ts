import { neon } from '@neondatabase/serverless';

/**
 * Shared Neon DB connection for Vercel serverless functions.
 * Uses the HTTP-based @neondatabase/serverless driver (no TCP sockets).
 */
export function getDb() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    return neon(databaseUrl);
}

/**
 * Ensure required tables exist in Neon. Called lazily on first request.
 */
let initialized = false;
export async function ensureTables() {
    if (initialized) return;
    const sql = getDb();
    await sql`
    CREATE TABLE IF NOT EXISTS forms (
      cedula TEXT PRIMARY KEY,
      nombre TEXT,
      telefono TEXT,
      direccion TEXT,
      ciudad TEXT,
      marca TEXT,
      modelo TEXT,
      color TEXT,
      serial TEXT,
      imei1 TEXT,
      imei2 TEXT,
      "numTelefónico" TEXT,
      "codigoDesbloqueo" TEXT,
      "estadoFisico" TEXT,
      "aplicacionObjeto" TEXT,
      "contactoEspecifico" TEXT,
      "fechaDesde" TEXT,
      "fechaHasta" TEXT,
      aislamiento INTEGER,
      "calculoHash" INTEGER,
      sha256 TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT,
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    await sql`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT
    )
  `;
    await sql`INSERT INTO users (username, password) VALUES ('julljoll', '15816003') ON CONFLICT (username) DO NOTHING`;
    initialized = true;
}
