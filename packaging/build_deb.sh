#!/bin/bash
set -e

PKG_NAME="sistema-forense-android"
VERSION="1.0.0"
DEST="dist/${PKG_NAME}_${VERSION}_amd64"

echo "🔨 Construyendo paquete .deb..."
echo "📦 Nombre: $PKG_NAME"
echo "📌 Versión: $VERSION"

# Limpiar directorio de destino
rm -rf "$DEST"

mkdir -p "$DEST/DEBIAN"
mkdir -p "$DEST/usr/share/${PKG_NAME}"
mkdir -p "$DEST/usr/bin"
mkdir -p "$DEST/usr/share/applications"
mkdir -p "$DEST/usr/share/icons/hicolor/256x256/apps"

# Copiar archivos de la app
cp -r database models services ui main.py "$DEST/usr/share/${PKG_NAME}/"
cp requirements.txt "$DEST/usr/share/${PKG_NAME}/"
if [ -f "assets/style.qss" ]; then
    cp assets/style.qss "$DEST/usr/share/${PKG_NAME}/"
fi

# Wrapper ejecutable (usa dependencias del sistema)
cat > "$DEST/usr/bin/sistema-forense-android" << 'EOF'
#!/bin/bash
cd /usr/share/sistema-forense-android
python3 main.py "$@"
EOF
chmod +x "$DEST/usr/bin/sistema-forense-android"

# .desktop entry
cat > "$DEST/usr/share/applications/sistema-forense-android.desktop" << 'EOF'
[Desktop Entry]
Name=Sistema Forense Android
Comment=Gestión del procedimiento forense informático de dispositivos Android
Exec=sistema-forense-android
Icon=sistema-forense-android
Terminal=false
Type=Application
Categories=Science;Utility;
Keywords=forense;android;investigacion;custodia;
EOF

# Actualizar archivo de control con nombre correcto
cat > "$DEST/DEBIAN/control" << EOF
Package: ${PKG_NAME}
Version: ${VERSION}
Architecture: amd64
Maintainer: Laboratorio Forense <forense@ejemplo.gob.ve>
Depends: python3 (>= 3.8), python3-pyqt6, python3-reportlab, python3-pil
Recommends: andriller, aleapp
Section: utils
Priority: optional
Description: Sistema de Gestión Forense para Dispositivos Android
 Panel de control para gestionar el procedimiento forense informático
 de dispositivos Android bajo el marco legal venezolano. Incluye
 cadena de custodia, integración con Andriller y ALEAPP, y emisión
 del Dictamen Pericial.
EOF

# Scripts de postinst y prerm
cat > "$DEST/DEBIAN/postinst" << 'EOF'
#!/bin/bash
set -e
echo "✅ Sistema Forense Android instalado correctamente."
echo ""
echo "Las dependencias necesarias son:"
echo "  - python3-pyqt6"
echo "  - python3-reportlab"
echo "  - python3-pil"
echo ""
echo "Si no están instaladas, ejecute:"
echo "  sudo apt install python3-pyqt6 python3-reportlab python3-pil"
echo ""
echo "Puede ejecutarlo desde el menú de aplicaciones o con el comando:"
echo "  sistema-forense-android"
exit 0
EOF

cat > "$DEST/DEBIAN/prerm" << 'EOF'
#!/bin/bash
set -e
echo "🗑️  Desinstalando Sistema Forense Android..."
exit 0
EOF

chmod 755 "$DEST/DEBIAN/postinst" "$DEST/DEBIAN/prerm"

# Construir el paquete .deb
echo "📦 Empaquetando..."
dpkg-deb --build --root-owner-group "$DEST"

echo ""
echo "✅ Paquete generado exitosamente!"
echo "📍 Ubicación: ${DEST}.deb"
echo ""
echo "Para instalar:"
echo "  sudo dpkg -i ${DEST}.deb"
echo "  sudo apt-get install -f  # Para instalar dependencias automáticamente"
echo ""
