import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import pg from "pg";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("forensic.db");
// ... (rest of the database initialization remains the same)

// Initialize SQLite Database
db.exec(`
  CREATE TABLE IF NOT EXISTS forms (
    id TEXT PRIMARY KEY,
    nombre TEXT,
    cedula TEXT,
    ciudad TEXT,
    telefono TEXT,
    direccion TEXT,
    marca TEXT,
    modelo TEXT,
    color TEXT,
    serial TEXT,
    imei1 TEXT,
    imei2 TEXT,
    numTelefónico TEXT,
    codigoDesbloqueo TEXT,
    estadoFisico TEXT,
    aplicacionObjeto TEXT,
    contactoEspecifico TEXT,
    fechaDesde TEXT,
    fechaHasta TEXT,
    aislamiento INTEGER,
    calculoHash INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT
  );

  INSERT OR IGNORE INTO users (username, password) VALUES ('julljoll', '15816003');
`);

// Postgres Pool for Neon
let pgPool: pg.Pool | null = null;

const getPgPool = async () => {
  if (pgPool) return pgPool;
  
  const setting = db.prepare("SELECT value FROM settings WHERE key = 'neo_config'").get();
  const config = setting ? JSON.parse(setting.value as string) : null;
  const connectionString = process.env.DATABASE_URL || config?.apiKey;

  if (connectionString) {
    pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    
    // Initialize Postgres Schema
    try {
      const client = await pgPool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS forms (
          id TEXT PRIMARY KEY,
          nombre TEXT,
          cedula TEXT,
          ciudad TEXT,
          telefono TEXT,
          direccion TEXT,
          marca TEXT,
          modelo TEXT,
          color TEXT,
          serial TEXT,
          imei1 TEXT,
          imei2 TEXT,
          numTelefónico TEXT,
          codigoDesbloqueo TEXT,
          estadoFisico TEXT,
          aplicacionObjeto TEXT,
          contactoEspecifico TEXT,
          fechaDesde TEXT,
          fechaHasta TEXT,
          aislamiento INTEGER,
          calculoHash INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      client.release();
      console.log("Connected to Neon Postgres");
    } catch (err) {
      console.error("Failed to connect to Neon Postgres:", err);
      pgPool = null;
    }
  }
  return pgPool;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json({ success: true, token: "fake-jwt-token" });
    } else {
      res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }
  });

  app.get("/api/forms", async (req, res) => {
    const pool = await getPgPool();
    if (pool) {
      try {
        const result = await pool.query("SELECT * FROM forms ORDER BY created_at DESC");
        return res.json(result.rows);
      } catch (err) {
        console.error("Postgres fetch error:", err);
      }
    }
    const forms = db.prepare("SELECT * FROM forms ORDER BY created_at DESC").all();
    res.json(forms);
  });

  app.post("/api/forms", async (req, res) => {
    const form = req.body;
    
    // Generate SHA256 hash of the form content
    const hashData = JSON.stringify({
      ...form,
      timestamp: new Date().toISOString(),
      random: Math.random()
    });
    const id = crypto.createHash('sha256').update(hashData).digest('hex');
    
    // Save to SQLite (Local Cache)
    const stmt = db.prepare(`
      INSERT INTO forms (
        id, nombre, cedula, ciudad, telefono, direccion, 
        marca, modelo, color, serial, imei1, imei2, 
        numTelefónico, codigoDesbloqueo, estadoFisico, 
        aplicacionObjeto, contactoEspecifico, fechaDesde, 
        fechaHasta, aislamiento, calculoHash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, form.nombre, form.cedula, form.ciudad, form.telefono, form.direccion,
      form.marca, form.modelo, form.color, form.serial, form.imei1, form.imei2,
      form.numTelefónico, form.codigoDesbloqueo, form.estadoFisico,
      form.aplicacionObjeto, form.contactoEspecifico, form.fechaDesde,
      form.fechaHasta, form.aislamiento ? 1 : 0, form.calculoHash ? 1 : 0
    );

    // Save to Postgres (Neon)
    const pool = await getPgPool();
    if (pool) {
      try {
        await pool.query(`
          INSERT INTO forms (
            id, nombre, cedula, ciudad, telefono, direccion, 
            marca, modelo, color, serial, imei1, imei2, 
            numTelefónico, codigoDesbloqueo, estadoFisico, 
            aplicacionObjeto, contactoEspecifico, fechaDesde, 
            fechaHasta, aislamiento, calculoHash
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        `, [
          id, form.nombre, form.cedula, form.ciudad, form.telefono, form.direccion,
          form.marca, form.modelo, form.color, form.serial, form.imei1, form.imei2,
          form.numTelefónico, form.codigoDesbloqueo, form.estadoFisico,
          form.aplicacionObjeto, form.contactoEspecifico, form.fechaDesde,
          form.fechaHasta, form.aislamiento ? 1 : 0, form.calculoHash ? 1 : 0
        ]);
      } catch (err) {
        console.error("Postgres save error:", err);
      }
    }

    res.json({ success: true, id });
  });

  app.get("/api/settings/neo", (req, res) => {
    const setting = db.prepare("SELECT value FROM settings WHERE key = 'neo_config'").get();
    res.json({ config: setting ? JSON.parse(setting.value as string) : null });
  });

  app.post("/api/settings/neo", async (req, res) => {
    const { config } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('neo_config', ?)").run(JSON.stringify(config));
    pgPool = null; // Reset pool to pick up new config
    const pool = await getPgPool();
    res.json({ success: true, status: pool ? 'connected' : 'failed' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
