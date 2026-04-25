# Sistema de Gestión Forense para Dispositivos Android

Panel de control para gestionar el procedimiento forense informático de dispositivos Android bajo el marco legal venezolano. Incluye cadena de custodia, integración con Andriller y ALEAPP, y emisión del Dictamen Pericial.

## Requisitos

- Ubuntu 20.04 o superior
- Python 3.11 o superior
- pip3
- Entorno gráfico X11 (para PyQt6)

## Instalación en Ubuntu

### Opción 1: Usando script de instalación (Recomendado)

```bash
# Clonar o descargar el repositorio
cd solicitud-por-consignacion

# Hacer ejecutable el script
chmod +x install.sh

# Ejecutar instalación
./install.sh
```

### Opción 2: Instalación manual con entorno virtual

```bash
# Instalar dependencias del sistema
sudo apt update
sudo apt install -y python3 python3-pip python3-venv \
    python3-pyqt6 libxcb-xinerama0 libxcb-cursor0 \
    libgl1-mesa-glx libxkbcommon0 libdbus-1-3

# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Actualizar pip
pip install --upgrade pip setuptools wheel

# Instalar dependencias
pip install -r requirements.txt

# Instalar la aplicación
pip install -e .
```

### Opción 3: Paquete .deb

```bash
# Construir paquete .deb
chmod +x packaging/build_deb.sh
./packaging/build_deb.sh

# Instalar paquete generado
sudo dpkg -i dist/solicitud-por-consignacion_1.0.0_amd64.deb
```

## Uso

### Con entorno virtual activado:

```bash
source venv/bin/activate
forense-android
```

O también:

```bash
source venv/bin/activate
python main.py
```

### Sin entorno virtual (si se instaló con pip -e):

```bash
forense-android
```

## Estructura del Proyecto

```
solicitud-por-consignacion/
├── main.py                 # Punto de entrada principal
├── requirements.txt        # Dependencias Python
├── setup.py               # Configuración de instalación
├── install.sh             # Script de instalación
├── ui/                    # Interfaz gráfica PyQt6
│   ├── main_window.py
│   └── sidebar.py
├── models/                # Modelos de datos
│   ├── caso.py
│   ├── dictamen.py
│   ├── dispositivo.py
│   └── prcc.py
├── database/              # Base de datos SQLite
│   ├── db_manager.py
│   └── schema.sql
├── services/              # Servicios externos
│   ├── aleapp_service.py
│   ├── andriller_service.py
│   ├── audit_service.py
│   ├── hash_service.py
│   └── print_service.py
├── assets/                # Recursos gráficos y estilos
│   └── style.qss
└── packaging/             # Scripts para empaquetado .deb
    ├── DEBIAN/
    └── build_deb.sh
```

## Dependencias

- **PyQt6**: Interfaz gráfica
- **ReportLab**: Generación de informes PDF
- **Pillow**: Procesamiento de imágenes

## Notas Importantes

⚠️ **Esta es una aplicación de escritorio** que requiere:
- Un entorno gráfico X11 funcionando
- No es compatible con servidores headless
- No puede desplegarse en plataformas web tradicionales

Para entornos sin interfaz gráfica, considere usar VNC o X11 forwarding SSH.

## Licencia

MIT License - Laboratorio Forense