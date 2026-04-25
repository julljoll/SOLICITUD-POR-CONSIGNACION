-- Tabla principal de casos
CREATE TABLE IF NOT EXISTS casos (
    id INTEGER PRIMARY KEY,
    numero_caso TEXT UNIQUE NOT NULL,
    fiscal TEXT,
    fecha_inicio TEXT,
    estado TEXT DEFAULT 'activo',
    paso_actual INTEGER DEFAULT 1
);

-- Dispositivos
CREATE TABLE IF NOT EXISTS dispositivos (
    id INTEGER PRIMARY KEY,
    caso_id INTEGER REFERENCES casos(id),
    marca TEXT, modelo TEXT, imei TEXT,
    sim_card TEXT, numero_tel TEXT,
    estado_fisico TEXT, modo_aislamiento TEXT,
    fotos_path TEXT,  -- JSON array de rutas
    fecha_fijacion TEXT
);

-- PRCC (Planilla de Cadena de Custodia)
CREATE TABLE IF NOT EXISTS prcc (
    id INTEGER PRIMARY KEY,
    caso_id INTEGER REFERENCES casos(id),
    numero_prcc TEXT UNIQUE,
    tipo TEXT DEFAULT 'principal',  -- 'principal' | 'derivada'
    funcionario_colector TEXT,
    cargo TEXT, organo TEXT,
    tipo_embalaje TEXT, numero_precinto TEXT,
    hash_sha256 TEXT, hash_md5 TEXT,
    estado_embalaje TEXT,
    nombre_firmante TEXT,
    fecha_creacion TEXT
);

-- Adquisiciones
CREATE TABLE IF NOT EXISTS adquisiciones (
    id INTEGER PRIMARY KEY,
    caso_id INTEGER REFERENCES casos(id),
    herramienta TEXT,  -- 'andriller' | 'aleapp'
    version_herramienta TEXT,
    ruta_salida TEXT,
    hash_origen_sha256 TEXT,
    hash_copia_sha256 TEXT,
    hashes_coinciden INTEGER,
    log_ejecucion TEXT,
    fecha_ejecucion TEXT
);

-- Evidencias derivadas
CREATE TABLE IF NOT EXISTS evidencias_derivadas (
    id INTEGER PRIMARY KEY,
    caso_id INTEGER REFERENCES casos(id),
    prcc_id INTEGER REFERENCES prcc(id),
    nombre_nativo TEXT,
    ruta_origen TEXT,
    tamanio_bytes INTEGER,
    hash_sha256 TEXT,
    fecha_creacion_metadata TEXT,
    fecha_modificacion_metadata TEXT,
    fecha_acceso_metadata TEXT,
    relevancia TEXT
);

-- Dictámenes
CREATE TABLE IF NOT EXISTS dictamenes (
    id INTEGER PRIMARY KEY,
    caso_id INTEGER REFERENCES casos(id),
    numero_dictamen TEXT,
    motivo TEXT, descripcion TEXT,
    examenes_practicados TEXT,
    resultados_json TEXT,
    conclusiones TEXT,
    consumo_evidencia TEXT,
    perito TEXT, credencial TEXT,
    fecha_emision TEXT
);

-- Log de trazabilidad (inmutable — solo INSERT)
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY,
    caso_id INTEGER,
    fase INTEGER, paso INTEGER,
    accion TEXT,
    usuario TEXT,
    fecha TEXT,
    hash_previo TEXT,   -- hash del registro anterior (chain)
    hash_actual TEXT    -- SHA-256(fase||paso||accion||usuario||fecha||hash_previo)
);
