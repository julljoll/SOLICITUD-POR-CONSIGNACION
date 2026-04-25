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
cp -r database models services ui assets main.py "$DEST/usr/share/${PKG_NAME}/"
cp requirements.txt "$DEST/usr/share/${PKG_NAME}/"

# Instalar dependencias Python en el paquete
pip3 install --target="$DEST/usr/share/${PKG_NAME}/vendor" \
    PyQt6 reportlab Pillow --quiet

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
chmod 755 "$DEST/DEBIAN/postinst" "$DEST/DEBIAN/prerm" || true

dpkg-deb --build --root-owner-group "$DEST"
echo "✅ Paquete generado: ${DEST}.deb"
