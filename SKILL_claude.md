---
name: forense-android-dashboard
description: >
  Construye una aplicación de escritorio en Python (PyQt6) para gestionar el proceso forense
  informático de dispositivos Android según el marco legal venezolano. Genera un panel de
  control con barra lateral de navegación por etapas, formularios imprimibles (PRCC, actas,
  dictamen), integración con Andriller y ALEAPP mediante subprocesos, cálculo de hashes
  SHA-256/MD5, base de datos SQLite para trazabilidad de casos, y empaquetado .deb para
  Ubuntu 24.04. Usar SIEMPRE este skill cuando el usuario pida construir, extender o
  modificar la interfaz del sistema forense, formularios legales venezolanos, cadena de
  custodia digital, integración con herramientas forenses, o empaquetado .deb de la app.
---

# Sistema Forense Android — Panel de Control (Python / PyQt6)

## Visión General

Aplicación de escritorio para gestionar las **3 fases del procedimiento forense** de
dispositivos Android según el Manual de Procedimiento Forense venezolano:

```
Fase I → Obtención y Adquisición en Sitio
Fase II → Peritaje y Análisis en Laboratorio
Fase III → Emisión del Dictamen Pericial
```

---

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| GUI | **PyQt6** | Licencia LGPL, excelente soporte Ubuntu 24.04 |
| Base de Datos | **SQLite** (via `sqlite3` stdlib) | Sin dependencias externas, portable |
| PDF/Impresión | **reportlab** + **QPrinter** | Formularios con firma y sello |
| Hash | **hashlib** (stdlib) | SHA-256 y MD5 nativos |
| Herramientas externas | **subprocess** | Lanzar Andriller y ALEAPP |
| Empaquetado | **fpm** o `dpkg-buildpackage` | Genera `.deb` para Ubuntu 24.04 |
| Estilos | Qt StyleSheets (QSS) | Tema oscuro profesional tipo panel control |

---

## Arquitectura del Proyecto

```
forense_android/
├── main.py                    # Punto de entrada, inicializa QApplication
├── database/
│   ├── db_manager.py          # Conexión SQLite, migrations, CRUD
│   └── schema.sql             # DDL de tablas
├── ui/
│   ├── main_window.py         # QMainWindow: splitter izq/centro
│   ├── sidebar.py             # Panel lateral - lista de pasos del proceso
│   ├── pages/
│   │   ├── home_page.py       # Dashboard resumen del caso activo
│   │   ├── fase1/
│   │   │   ├── aislamiento_page.py    # Paso 1: Form fijación dispositivo
│   │   │   ├── adquisicion_page.py    # Paso 2: Lanzador Andriller + log
│   │   │   └── prcc_page.py           # Paso 3: Form PRCC completo + imprimir
│   │   ├── fase2/
│   │   │   ├── recepcion_page.py      # Paso 4: Verificación hash + form
│   │   │   ├── aleapp_page.py         # Paso 5: Lanzador ALEAPP + visor
│   │   │   └── derivacion_page.py     # Paso 6: Evidencia derivada + PRCC
│   │   └── fase3/
│   │       ├── fundamentacion_page.py # Paso 7: Base legal
│   │       ├── dictamen_page.py       # Paso 8: Informe auto-poblado
│   │       └── cierre_page.py         # Paso 9: Disposición final
│   └── widgets/
│       ├── hash_widget.py     # Widget reutilizable cálculo hash
│       ├── log_viewer.py      # Visor stdout/stderr de procesos externos
│       └── status_badge.py    # Semáforo visual por paso (pendiente/ok/error)
├── services/
│   ├── hash_service.py        # Cálculo MD5/SHA-256 con progress
│   ├── andriller_service.py   # Wrapper subprocess Andriller
│   ├── aleapp_service.py      # Wrapper subprocess ALEAPP
│   ├── print_service.py       # Generación PDF reportlab + QPrintDialog
│   └── audit_service.py       # Escritura del log de trazabilidad
├── models/
│   ├── caso.py                # Dataclass Caso
│   ├── dispositivo.py         # Dataclass Dispositivo
│   ├── prcc.py                # Dataclass PRCC
│   └── dictamen.py            # Dataclass Dictamen
├── assets/
│   ├── logo.png               # Logo institucional
│   ├── style.qss              # Hoja de estilos Qt global
│   └── fonts/                 # Fuentes opcionales
├── packaging/
│   ├── DEBIAN/
│   │   ├── control            # Metadatos paquete .deb
│   │   ├── postinst           # Script post-instalación
│   │   └── prerm              # Script pre-desinstalación
│   ├── usr/
│   │   ├── bin/forense-android        # Symlink ejecutable
│   │   ├── share/applications/
│   │   │   └── forense-android.desktop
│   │   └── share/forense-android/     # Archivos de la app
│   └── build_deb.sh           # Script automatizado de empaquetado
├── requirements.txt
└── setup.py
```

---

## Layout de la Interfaz Principal

```
┌─────────────────────────────────────────────────────────────┐
│  🔒 SISTEMA FORENSE ANDROID  │  Caso: CF-2024-001  [●activo]│
├────────────────────┬────────────────────────────────────────┤
│  PROCESO FORENSE   │                                        │
│  ────────────────  │         PANEL CENTRAL                  │
│  📁 Caso Activo    │    (QStackedWidget — contenido         │
│                    │     cambia según ítem seleccionado)    │
│  ── FASE I ──      │                                        │
│  ✅ 1. Aislamiento │                                        │
│  ✅ 2. Adquisición │                                        │
│  ⏳ 3. Cadena Cust │                                        │
│                    │                                        │
│  ── FASE II ──     │                                        │
│  🔘 4. Recepción   │                                        │
│  🔘 5. ALEAPP      │                                        │
│  🔘 6. Derivación  │                                        │
│                    │                                        │
│  ── FASE III ──    │                                        │
│  🔘 7. Fundament.  │                                        │
│  🔘 8. Dictamen    │                                        │
│  🔘 9. Cierre      │                                        │
│                    │                                        │
│  ────────────────  │                                        │
│  📊 Trazabilidad   │                                        │
│  ⚙️  Configuración  │                                        │
└────────────────────┴────────────────────────────────────────┘
```

**Regla de estados del sidebar:**
- `🔘` Pendiente (gris): paso no iniciado
- `⏳` En progreso (amarillo): formulario abierto o proceso corriendo
- `✅` Completado (verde): datos guardados y hash verificado
- `❌` Error (rojo): fallo en proceso o hash no coincide

El paso siguiente solo se habilita cuando el anterior está `✅`.

---

## Descripción Detallada de Cada Página

### HOME — Dashboard del Caso

Muestra un resumen del caso activo:
- Número de expediente, fiscal asignado, fecha inicio
- Barra de progreso de las 9 etapas
- Tabla de evidencias registradas (dispositivo principal + derivadas)
- Botón **"Nuevo Caso"** y **"Abrir Caso Existente"**

### PASO 1 — Aislamiento y Fijación

**Formulario campos:**
```
Número de Caso:        [________________]
Fecha/Hora:            [auto - editable ]
Funcionario:           [________________]
Modo aislamiento:      ● Modo Avión  ○ Bolsa Faraday
Estado físico:         [textarea]
Marca/Modelo:          [________________]
IMEI:                  [________________]  [Copiar]
SIM Card N°:           [________________]
Número telefónico:     [________________]
Daños visibles:        [textarea]
Fotografías adjuntas:  [Agregar fotos...]  [lista thumbs]

                       [💾 Guardar]  [🖨️ Imprimir Acta]
```

Al guardar: escribe en SQLite, marca paso como ✅, registra en log de trazabilidad.

### PASO 2 — Adquisición con Andriller

**Layout dividido en dos columnas:**

*Columna izquierda — Configuración:*
```
Ruta de salida:    [/ruta/caso/]  [Examinar...]
Tipo extracción:   ● Lógica  ○ Física
Andriller path:    [/usr/bin/andriller]  [Detectar]
Write-blocker:     [✓] Hardware conectado (declaración)
```

*Columna derecha — Ejecución y Log:*
```
[▶ INICIAR EXTRACCIÓN ANDRILLER]
─────────────────────────────────
[visor de stdout/stderr en tiempo real]
[barra de progreso]
─────────────────────────────────
Hash origen   (SHA-256): [_________________________]
Hash adquirido(SHA-256): [_________________________]
                [🔍 Calcular Hashes]
Estado: ✅ Hashes coinciden / ❌ HASHES NO COINCIDEN
```

La extracción usa `QProcess` (no `subprocess` bloqueante) para no congelar la UI.

### PASO 3 — Cadena de Custodia (PRCC)

Formulario completo de la **Planilla de Registro de Cadena de Custodia**:

```
════════════════════════════════════════
  PLANILLA DE REGISTRO CADENA CUSTODIA
════════════════════════════════════════
Número PRCC:       [CF-PRCC-2024-001]
Expediente N°:     [________________]
Fecha/hora:        [auto]
Órgano:            [________________]
Funcionario colector: [______________]
Cargo:             [________________]

── DESCRIPCIÓN DE LA EVIDENCIA ──
Tipo objeto:       [Dispositivo Móvil]
Marca/Modelo:      [auto-poblado paso 1]
Color:             [________________]
IMEI:              [auto-poblado]
Embalaje:          ● Bolsa ○ Caja ○ Sobre
N° precinto:       [________________]
Hash SHA-256:      [auto-poblado paso 2]
Hash MD5:          [auto-poblado paso 2]

── CONDICIONES RECEPCIÓN ──
Estado embalaje:   ● Buenas ○ Deterioradas ○ Rotas

── FIRMA Y DACTILAR ──
[ campo firma digital o nombre completo ]
[Huella Pulgar Derecho — instrucción]

[💾 Guardar PRCC]  [🖨️ Imprimir PRCC]  [📄 Exportar PDF]
```

### PASO 4 — Recepción en Laboratorio

```
Perito receptor:   [________________]
Fecha recepción:   [auto]
N° PRCC recibida:  [auto-poblado]
Precintos:         ● Íntegros ○ Violados

── VERIFICACIÓN HASH ──
Hash original (PRCC): [auto desde BD]
Hash recalculado:     [________________]  [📂 Seleccionar imagen]
                      [🔍 Recalcular Hash]
Resultado:  ✅ COINCIDEN — Evidencia íntegra
         o  ❌ NO COINCIDEN — ALERTA CRÍTICA

[💾 Confirmar Recepción]
```

Si los hashes no coinciden: muestra diálogo de alerta rojo, bloquea avance y obliga a documentar la discrepancia.

### PASO 5 — Análisis con ALEAPP

*Mismo patrón que Andriller:*

```
Imagen forense:    [ruta auto-poblada paso 2]  [Cambiar]
ALEAPP path:       [/usr/bin/aleapp]  [Detectar]
Ruta salida:       [/ruta/caso/aleapp-output/]

[▶ INICIAR ANÁLISIS ALEAPP]
─────────────────────────────────────────────
[visor log tiempo real — QProcess]
[barra progreso]
─────────────────────────────────────────────

── RESULTADOS ──
[tabla: Módulo | Registros | Estado]
[botón: 📂 Abrir reporte HTML en navegador]
[botón: 📊 Ver Timeline reconstruida]
```

### PASO 6 — Evidencia Derivada

Si del análisis surgen archivos clave (videos, audios, BD):

```
Archivos relevantes encontrados:
[tabla seleccionable de archivos del output de ALEAPP]

Para cada archivo seleccionado:
  Nombre nativo:   [auto]
  Ruta origen:     [auto]
  Tamaño:          [auto]
  Hash SHA-256:    [auto-calculado]
  Fecha creación:  [auto de metadata]
  Fecha modif.:    [auto de metadata]
  Relevancia:      [textarea justificación]

[+ Agregar como Evidencia Derivada]

Evidencias derivadas registradas:
[tabla con PRCC asignada a cada una]

[🖨️ Imprimir Acta de Obtención por Derivación]
```

### PASO 7 — Fundamentación Jurídica

Panel informativo + editor:
```
Marco legal aplicable (pre-cargado, editable):
─────────────────────────────────────────────
[✓] Art. 4 y 8 Ley Mensajes de Datos — eficacia probatoria
[✓] COPP — licitud de la prueba
[✓] Ley Especial Delitos Informáticos
[✓] ISO/IEC 27037:2012 — adquisición
[✓] ISO/IEC 27042:2015 — análisis
[✓] NIST SP 800-101r1 — dispositivos móviles

Delitos aplicables (marcar):
[ ] Acceso indebido (Art. X LEDI)
[ ] Violación de privacidad (Art. X LEDI)
[ ] Sabotaje o daño (Art. X LEDI)
[ ] Otro: [________________]
```

### PASO 8 — Dictamen Pericial

Informe **auto-poblado** desde todos los datos del caso. Secciones editables:

```
══════════════════════════════════════
       DICTAMEN PERICIAL N° ____
══════════════════════════════════════
1. MOTIVO
   [auto-poblado + editable]

2. DESCRIPCIÓN DE LA EVIDENCIA
   [auto-poblado desde Paso 1 y PRCC]

3. EXÁMENES PRACTICADOS
   Andriller v[x.x.x] — extracción lógica
   ALEAPP v[x.x.x] — parseo SQLite/Protobuf
   Hash SHA-256 origen:   [auto]
   Hash SHA-256 copia:    [auto]
   [tabla de técnicas usadas]

4. RESULTADOS OBTENIDOS
   [tabla auto-poblada: nombre archivo | fecha creac. |
    fecha modif. | fecha acceso | ruta | tamaño | hash]

5. CONCLUSIONES
   [textarea — solo juicio técnico, SIN calificación jurídica]
   ⚠️ Advertencia: no incluir precalificaciones jurídicas

6. CONSUMO DE EVIDENCIA
   ● No se alteró la data original (solo lectura)
   ○ Hubo consumo: [especificar...]

Perito Actuante:   [________________]
Credencial N°:     [________________]
Fecha:             [auto]

[💾 Guardar Dictamen]  [🖨️ Imprimir]  [📄 Exportar PDF]
```

### PASO 9 — Cierre y Disposición Final

```
Destino de la evidencia:
  ● Devolver al Área de Resguardo Judicial
  ○ Entregar al Fiscal
  ○ Disposición Final (destrucción autorizada)

Funcionario receptor:   [________________]
Fecha/hora entrega:     [auto]
Observaciones:          [textarea]

[Si disposición final] → genera Acta de Disposición Final

[✅ CERRAR CASO]
```

### TRAZABILIDAD (Log de Auditoría)

Tabla cronológica inmutable de todas las acciones:

```
[Fecha/Hora]  [Fase]  [Paso]  [Acción]  [Usuario]  [Hash estado BD]
─────────────────────────────────────────────────────────────────────
2024-01-15 09:23  F1  P1  Formulario Aislamiento guardado  Perito01
2024-01-15 09:45  F1  P2  Andriller iniciado - PID 1234    Perito01
2024-01-15 10:02  F1  P2  Hash SHA-256 verificado ✅        Perito01
...
```

Cada entrada tiene su propio hash encadenado (similar a blockchain simple) para detectar manipulación del log.

---

## Base de Datos SQLite — Esquema

```sql
-- Tabla principal de casos
CREATE TABLE casos (
    id INTEGER PRIMARY KEY,
    numero_caso TEXT UNIQUE NOT NULL,
    fiscal TEXT,
    fecha_inicio TEXT,
    estado TEXT DEFAULT 'activo',
    paso_actual INTEGER DEFAULT 1
);

-- Dispositivos
CREATE TABLE dispositivos (
    id INTEGER PRIMARY KEY,
    caso_id INTEGER REFERENCES casos(id),
    marca TEXT, modelo TEXT, imei TEXT,
    sim_card TEXT, numero_tel TEXT,
    estado_fisico TEXT, modo_aislamiento TEXT,
    fotos_path TEXT,  -- JSON array de rutas
    fecha_fijacion TEXT
);

-- PRCC (Planilla de Cadena de Custodia)
CREATE TABLE prcc (
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
CREATE TABLE adquisiciones (
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
CREATE TABLE evidencias_derivadas (
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
CREATE TABLE dictamenes (
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
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY,
    caso_id INTEGER,
    fase INTEGER, paso INTEGER,
    accion TEXT,
    usuario TEXT,
    fecha TEXT,
    hash_previo TEXT,   -- hash del registro anterior (chain)
    hash_actual TEXT    -- SHA-256(fase||paso||accion||usuario||fecha||hash_previo)
);
```

---

## Servicios Clave

### `hash_service.py`

```python
import hashlib
from pathlib import Path
from typing import Callable

def calcular_hash_archivo(
    ruta: str,
    algoritmo: str = "sha256",
    progreso_cb: Callable[[int], None] | None = None
) -> str:
    """
    Lee el archivo en bloques de 64KB para no saturar RAM.
    Llama progreso_cb(porcentaje) si se provee.
    """
    h = hashlib.new(algoritmo)
    tamano = Path(ruta).stat().st_size
    leido = 0
    BLOQUE = 65536
    with open(ruta, "rb") as f:
        while chunk := f.read(BLOQUE):
            h.update(chunk)
            leido += len(chunk)
            if progreso_cb:
                progreso_cb(int(leido * 100 / tamano))
    return h.hexdigest()
```

### `andriller_service.py`

```python
from PyQt6.QtCore import QProcess, pyqtSignal, QObject

class AndrillerService(QObject):
    output_line = pyqtSignal(str)
    finished = pyqtSignal(int)  # exit code

    def __init__(self):
        super().__init__()
        self._proc = QProcess(self)
        self._proc.readyReadStandardOutput.connect(self._on_stdout)
        self._proc.readyReadStandardError.connect(self._on_stderr)
        self._proc.finished.connect(self.finished)

    def iniciar(self, andriller_bin: str, ruta_salida: str, modo: str):
        args = ["--output", ruta_salida, "--mode", modo]
        self._proc.start(andriller_bin, args)

    def _on_stdout(self):
        data = self._proc.readAllStandardOutput().data().decode(errors="replace")
        for line in data.splitlines():
            self.output_line.emit(line)

    def _on_stderr(self):
        data = self._proc.readAllStandardError().data().decode(errors="replace")
        for line in data.splitlines():
            self.output_line.emit(f"[ERR] {line}")

    def cancelar(self):
        self._proc.terminate()
```

El mismo patrón aplica para `aleapp_service.py`.

### `print_service.py`

```python
from reportlab.platypus import SimpleDocTemplate, Table, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from PyQt6.QtPrintSupport import QPrintDialog, QPrinter
from PyQt6.QtGui import QTextDocument

def generar_pdf_prcc(prcc_data: dict, ruta_pdf: str) -> str:
    """Genera PDF de la PRCC con reportlab. Retorna ruta."""
    doc = SimpleDocTemplate(ruta_pdf, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    # ... construir contenido desde prcc_data
    doc.build(story)
    return ruta_pdf

def imprimir_documento(html_content: str, parent_widget=None):
    """Abre diálogo de impresión Qt para cualquier contenido HTML."""
    printer = QPrinter(QPrinter.PrinterMode.HighResolution)
    dialog = QPrintDialog(printer, parent_widget)
    if dialog.exec() == QPrintDialog.DialogCode.Accepted:
        doc = QTextDocument()
        doc.setHtml(html_content)
        doc.print(printer)
```

---

## Estilos QSS (Tema Oscuro Profesional)

```css
/* style.qss */
QMainWindow {
    background-color: #1a1d23;
}
QWidget#sidebar {
    background-color: #13161b;
    border-right: 2px solid #2d3748;
    min-width: 220px;
    max-width: 260px;
}
QListWidget {
    background: transparent;
    border: none;
    color: #a0aec0;
    font-size: 13px;
}
QListWidget::item:selected {
    background-color: #2b6cb0;
    color: #ffffff;
    border-radius: 6px;
}
QListWidget::item:hover {
    background-color: #2d3748;
    border-radius: 6px;
}
QPushButton#btnPrimary {
    background-color: #2b6cb0;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 20px;
    font-size: 13px;
    font-weight: bold;
}
QPushButton#btnPrimary:hover { background-color: #3182ce; }
QPushButton#btnDanger {
    background-color: #c53030;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 20px;
}
QLineEdit, QTextEdit, QComboBox {
    background-color: #2d3748;
    border: 1px solid #4a5568;
    border-radius: 4px;
    color: #e2e8f0;
    padding: 6px;
}
QLabel#sectionTitle {
    color: #90cdf4;
    font-size: 16px;
    font-weight: bold;
}
QLabel#phaseHeader {
    color: #68d391;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    padding: 8px 4px 4px 4px;
}
```

---

## Empaquetado .deb (Ubuntu 24.04)

### `packaging/DEBIAN/control`

```
Package: forense-android
Version: 1.0.0
Architecture: amd64
Maintainer: Laboratorio Forense <forense@ejemplo.gob.ve>
Depends: python3 (>= 3.11), python3-pyqt6, python3-reportlab
Recommends: andriller, aleapp
Section: utils
Priority: optional
Description: Sistema de Gestión Forense para Dispositivos Android
 Panel de control para gestionar el procedimiento forense informático
 de dispositivos Android bajo el marco legal venezolano. Incluye
 cadena de custodia, integración con Andriller y ALEAPP, y emisión
 del Dictamen Pericial.
```

### `packaging/build_deb.sh`

```bash
#!/bin/bash
set -e
PKG_NAME="forense-android"
VERSION="1.0.0"
DEST="dist/${PKG_NAME}_${VERSION}_amd64"

mkdir -p "$DEST/DEBIAN"
mkdir -p "$DEST/usr/share/${PKG_NAME}"
mkdir -p "$DEST/usr/bin"
mkdir -p "$DEST/usr/share/applications"

# Copiar archivos de la app
cp -r forense_android/ "$DEST/usr/share/${PKG_NAME}/"
cp requirements.txt "$DEST/usr/share/${PKG_NAME}/"

# Instalar dependencias Python en el paquete
pip3 install --target="$DEST/usr/share/${PKG_NAME}/vendor" \
    PyQt6 reportlab --quiet

# Wrapper ejecutable
cat > "$DEST/usr/bin/forense-android" << 'EOF'
#!/bin/bash
cd /usr/share/forense-android
PYTHONPATH=/usr/share/forense-android/vendor python3 main.py "$@"
EOF
chmod +x "$DEST/usr/bin/forense-android"

# .desktop entry
cat > "$DEST/usr/share/applications/forense-android.desktop" << 'EOF'
[Desktop Entry]
Name=Sistema Forense Android
Comment=Gestión del procedimiento forense informático
Exec=forense-android
Icon=/usr/share/forense-android/assets/logo.png
Terminal=false
Type=Application
Categories=Science;Utility;
EOF

# Copiar DEBIAN control
cp packaging/DEBIAN/* "$DEST/DEBIAN/"
chmod 755 "$DEST/DEBIAN/postinst" "$DEST/DEBIAN/prerm"

dpkg-deb --build --root-owner-group "$DEST"
echo "✅ Paquete generado: ${DEST}.deb"
```

### `packaging/DEBIAN/postinst`

```bash
#!/bin/bash
# Crear directorio de datos de usuario
mkdir -p /var/lib/forense-android/casos
chmod 700 /var/lib/forense-android
echo "Sistema Forense Android instalado correctamente."
```

---

## Reglas de Implementación para el Agente

1. **Nunca bloquear el hilo principal de Qt.** Todas las operaciones largas (hash, Andriller, ALEAPP) usan `QProcess` o `QThread` + señales.

2. **Trazabilidad inmutable.** El `audit_log` solo acepta INSERTs. Nunca UPDATE ni DELETE. Cada registro incluye el hash del anterior para detectar manipulación.

3. **Hashes siempre comparados visualmente.** Cuando se muestran dos hashes (origen vs copia), resaltarlos en verde si coinciden, rojo si no. Mostrar los 64 caracteres completos del SHA-256.

4. **Flujo lineal con desbloqueo progresivo.** Un paso se marca ✅ solo cuando todos sus campos obligatorios están guardados en SQLite. El siguiente paso aparece habilitado solo entonces.

5. **Formularios imprimibles.** Todo formulario legal (PRCC, Acta de Obtención, Dictamen) tiene botón "Imprimir" que genera PDF via reportlab y abre `QPrintDialog`.

6. **Auto-población de datos.** Los pasos posteriores leen de SQLite los datos de pasos anteriores y pre-llenan sus campos.

7. **Multi-caso.** La app permite gestionar varios casos. Al abrir, muestra selector de casos o crea uno nuevo con número único auto-generado.

8. **Validación estricta de IMEI.** El campo IMEI debe validar formato de 15 dígitos con algoritmo de Luhn.

9. **Zona horaria.** Registrar siempre UTC y mostrar hora local venezolana (UTC-4) con conversión explícita.

10. **Sin hardcodear rutas.** Las rutas de Andriller, ALEAPP y directorio de casos deben ser configurables desde `⚙️ Configuración` y guardadas en `~/.config/forense-android/config.ini`.

---

## `requirements.txt`

```
PyQt6>=6.6.0
reportlab>=4.0.0
Pillow>=10.0.0
```

---

## Orden de Construcción Recomendado

1. `schema.sql` + `db_manager.py`
2. `models/` — dataclasses puras
3. `services/hash_service.py`
4. `ui/main_window.py` + `sidebar.py` (navegación vacía funcional)
5. `pages/fase1/` en orden: aislamiento → adquisicion → prcc
6. `services/andriller_service.py` + `services/aleapp_service.py`
7. `pages/fase2/` en orden
8. `pages/fase3/` en orden
9. `services/print_service.py`
10. `assets/style.qss`
11. `packaging/` + `build_deb.sh`
12. Pruebas de integración + `.deb` final
