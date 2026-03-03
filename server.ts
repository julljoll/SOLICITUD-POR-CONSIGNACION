import 'dotenv/config'; // Load .env before anything else
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
// Drop old table if it has the old schema (id as primary key)
const tableInfo = db.prepare("PRAGMA table_info(forms)").all() as any[];
const hasIdColumn = tableInfo.some(col => col.name === 'id');
const hasSha256Column = tableInfo.some(col => col.name === 'sha256');

if (hasIdColumn || !hasSha256Column) {
  console.log("Updating forms table schema...");
  db.exec("DROP TABLE IF EXISTS forms");
}

db.exec(`
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
    numTelefónico TEXT,
    codigoDesbloqueo TEXT,
    estadoFisico TEXT,
    aplicacionObjeto TEXT,
    contactoEspecifico TEXT,
    fechaDesde TEXT,
    fechaHasta TEXT,
    aislamiento INTEGER,
    calculoHash INTEGER,
    sha256 TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
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

  INSERT OR IGNORE INTO posts (title, content) VALUES 
  ('Sistema SHA256.US Activo', 'Se ha desplegado la versión 1.0 del sistema de planillas forenses con integración Neon DB.'),
  ('Actualización de Seguridad', 'Se ha implementado la generación de hashes SHA256 reales para cada documento generado.');
`);

// Postgres Pool for Neon
let pgPool: pg.Pool | null = null;

const getPgPool = async () => {
  if (pgPool) return pgPool;

  const setting = db.prepare("SELECT value FROM settings WHERE key = 'neo_config'").get();
  const config = setting ? JSON.parse(setting.value as string) : null;

  let connectionString = process.env.DATABASE_URL;

  // If env var is missing or invalid, fallback to UI config
  if (!connectionString || !connectionString.startsWith('postgres')) {
    connectionString = config?.apiKey;
  }

  if (connectionString && connectionString.startsWith('postgres')) {
    console.log("Attempting to connect to Postgres...");
    pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000, // 10 second timeout
    });

    // Initialize Postgres Schema
    try {
      const client = await pgPool.connect();
      await client.query(`
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
          numTelefónico TEXT,
          codigoDesbloqueo TEXT,
          estadoFisico TEXT,
          aplicacionObjeto TEXT,
          contactoEspecifico TEXT,
          fechaDesde TEXT,
          fechaHasta TEXT,
          aislamiento INTEGER,
          calculoHash INTEGER,
          sha256 TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          title TEXT,
          content TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      client.release();
      console.log("Successfully connected to Neon Postgres");
    } catch (err: any) {
      console.error("Failed to connect to Neon Postgres:", err.message);
      if (err.code === 'EAI_AGAIN') {
        console.error("DNS Resolution Error. This is often a temporary network issue. Retrying may help.");
      }
      pgPool = null;
    }
  } else if (connectionString) {
    console.warn("Invalid connection string format detected. Connection aborted.");
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

  app.delete("/api/forms/:sha256", async (req, res) => {
    const { sha256 } = req.params;
    try {
      // Delete from SQLite
      db.prepare("DELETE FROM forms WHERE sha256 = ?").run(sha256);

      // Delete from Postgres if connected
      const pool = await getPgPool();
      if (pool) {
        try {
          await pool.query("DELETE FROM forms WHERE sha256 = $1", [sha256]);
        } catch (err) {
          console.error("Postgres delete error:", err);
        }
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete form error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/posts", async (req, res) => {
    const pool = await getPgPool();
    if (pool) {
      const client = await pool.connect();
      try {
        const { rows } = await client.query('SELECT * FROM posts ORDER BY created_at DESC');
        return res.json(rows);
      } catch (err) {
        console.error("Postgres posts fetch error:", err);
      } finally {
        client.release();
      }
    }
    const posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
    res.json(posts);
  });

  app.post("/api/posts", async (req, res) => {
    const { title, content } = req.body;

    // Save to SQLite
    db.prepare("INSERT INTO posts (title, content) VALUES (?, ?)").run(title, content);

    // Save to Postgres
    const pool = await getPgPool();
    if (pool) {
      try {
        await pool.query("INSERT INTO posts (title, content) VALUES ($1, $2)", [title, content]);
      } catch (err) {
        console.error("Postgres post save error:", err);
      }
    }
    res.json({ success: true });
  });

  app.post("/api/forms", async (req, res) => {
    try {
      const form = req.body;
      console.log("Incoming form submission:", form.nombre);

      // Generate SHA256 hash of the form content
      const hashData = JSON.stringify({
        ...form,
        timestamp: new Date().toISOString(),
        random: Math.random()
      });
      const id = crypto.createHash('sha256').update(hashData).digest('hex');

      // Save to SQLite (Local Cache)
      try {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO forms (
            cedula, nombre, telefono, direccion, ciudad,
            marca, modelo, color, serial, imei1, imei2, 
            numTelefónico, codigoDesbloqueo, estadoFisico, 
            aplicacionObjeto, contactoEspecifico, fechaDesde, 
            fechaHasta, aislamiento, calculoHash, sha256
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          form.cedula, form.nombre, form.telefono, form.direccion, form.ciudad,
          form.marca, form.modelo, form.color, form.serial, form.imei1, form.imei2,
          form.numTelefónico, form.codigoDesbloqueo, form.estadoFisico,
          form.aplicacionObjeto, form.contactoEspecifico, form.fechaDesde,
          form.fechaHasta, form.aislamiento ? 1 : 0, form.calculoHash ? 1 : 0, id
        );
        console.log("Form saved to SQLite successfully:", form.cedula);
      } catch (sqliteErr) {
        console.error("SQLite save error:", sqliteErr);
        throw new Error(`Error al guardar localmente: ${sqliteErr instanceof Error ? sqliteErr.message : 'Desconocido'}`);
      }

      // Save to Postgres (Neon)
      const pool = await getPgPool();
      if (pool) {
        try {
          await pool.query(`
            INSERT INTO forms (
              cedula, nombre, telefono, direccion, ciudad,
              marca, modelo, color, serial, imei1, imei2, 
              numTelefónico, codigoDesbloqueo, estadoFisico, 
              aplicacionObjeto, contactoEspecifico, fechaDesde, 
              fechaHasta, aislamiento, calculoHash, sha256
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            ON CONFLICT (cedula) DO UPDATE SET
              nombre = EXCLUDED.nombre,
              telefono = EXCLUDED.telefono,
              direccion = EXCLUDED.direccion,
              ciudad = EXCLUDED.ciudad,
              marca = EXCLUDED.marca,
              modelo = EXCLUDED.modelo,
              color = EXCLUDED.color,
              serial = EXCLUDED.serial,
              imei1 = EXCLUDED.imei1,
              imei2 = EXCLUDED.imei2,
              numTelefónico = EXCLUDED.numTelefónico,
              codigoDesbloqueo = EXCLUDED.codigoDesbloqueo,
              estadoFisico = EXCLUDED.estadoFisico,
              aplicacionObjeto = EXCLUDED.aplicacionObjeto,
              contactoEspecifico = EXCLUDED.contactoEspecifico,
              fechaDesde = EXCLUDED.fechaDesde,
              fechaHasta = EXCLUDED.fechaHasta,
              aislamiento = EXCLUDED.aislamiento,
              calculoHash = EXCLUDED.calculoHash,
              sha256 = EXCLUDED.sha256
          `, [
            form.cedula, form.nombre, form.telefono, form.direccion, form.ciudad,
            form.marca, form.modelo, form.color, form.serial, form.imei1, form.imei2,
            form.numTelefónico, form.codigoDesbloqueo, form.estadoFisico,
            form.aplicacionObjeto, form.contactoEspecifico, form.fechaDesde,
            form.fechaHasta, form.aislamiento ? 1 : 0, form.calculoHash ? 1 : 0, id
          ]);
          console.log("Form saved to Neon successfully");
        } catch (err) {
          console.error("Postgres save error:", err);
        }
      }

      res.json({ success: true, id });
    } catch (error: any) {
      console.error("General form save error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/settings/neo/status", async (req, res) => {
    const pool = await getPgPool();
    res.json({ status: pool ? 'connected' : 'disconnected' });
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
    // Attempt to connect to Postgres on startup
    getPgPool().catch(err => console.error("Initial Postgres connection failed:", err));
  });
}

startServer();
