#!/bin/bash
# Script de instalación para entornos virtuales Python en Ubuntu
# Uso: ./install.sh

set -e

echo "🔍 Verificando requisitos..."

# Verificar Python 3.11+
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
REQUIRED_VERSION="3.11"

if [[ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]]; then
    echo "❌ Se requiere Python 3.11 o superior (instalado: $PYTHON_VERSION)"
    exit 1
fi

echo "✅ Python $PYTHON_VERSION detectado"

# Verificar pip
if ! python3 -m pip --version &> /dev/null; then
    echo "⚠️ pip no está disponible, instalando..."
    sudo apt update
    sudo apt install -y python3-pip python3-venv
fi

echo "✅ pip disponible"

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "🔄 Activando entorno virtual..."
source venv/bin/activate

# Actualizar pip
echo "🔄 Actualizando pip..."
pip install --upgrade pip setuptools wheel

# Instalar dependencias del sistema para PyQt6
echo "📦 Instalando dependencias del sistema..."
sudo apt update
sudo apt install -y \
    python3-pyqt6 \
    libxcb-xinerama0 \
    libxcb-cursor0 \
    libgl1-mesa-glx \
    libxkbcommon0 \
    libdbus-1-3

# Instalar dependencias Python
echo "📦 Instalando dependencias Python..."
pip install -r requirements.txt

# Instalar la aplicación en modo desarrollo
echo "🔧 Instalando aplicación..."
pip install -e .

echo ""
echo "✅ Instalación completada exitosamente"
echo ""
echo "Para ejecutar la aplicación:"
echo "  source venv/bin/activate"
echo "  forense-android"
echo ""
echo "O también:"
echo "  source venv/bin/activate"
echo "  python main.py"
