import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("forensic.db");

// Initialize Database
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

  INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'admin123');
`);

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

  app.get("/api/forms", (req, res) => {
    const forms = db.prepare("SELECT * FROM forms ORDER BY created_at DESC").all();
    res.json(forms);
  });

  app.post("/api/forms", (req, res) => {
    const form = req.body;
    const id = `SHA-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
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

    res.json({ success: true, id });
  });

  app.get("/api/settings/neo", (req, res) => {
    const setting = db.prepare("SELECT value FROM settings WHERE key = 'neo_config'").get();
    res.json({ config: setting ? JSON.parse(setting.value) : null });
  });

  app.post("/api/settings/neo", (req, res) => {
    const { config } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('neo_config', ?)").run(JSON.stringify(config));
    res.json({ success: true });
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
