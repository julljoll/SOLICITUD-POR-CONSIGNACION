from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QScrollArea, 
    QLabel, QLineEdit, QTextEdit, QComboBox, QCheckBox, 
    QPushButton, QGroupBox, QGridLayout, QSpacerItem, QSizePolicy,
    QDateEdit, QMessageBox, QFileDialog
)
from PyQt6.QtCore import Qt, QDate
from PyQt6.QtGui import QFont


class FormularioPRCC(QWidget):
    """Formulario PRCC - Planilla de Registro de Cadena de Custodia"""
    
    def __init__(self):
        super().__init__()
        self._init_ui()
        
    def _init_ui(self):
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        scroll.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        
        container = QWidget()
        self.main_layout = QVBoxLayout(container)
        self.main_layout.setSpacing(20)
        self.main_layout.setContentsMargins(20, 20, 20, 20)
        
        # === SECCIÓN I: Datos del Solicitante ===
        self._crear_seccion_i()
        
        # === SECCIÓN II: Identificación del Dispositivo ===
        self._crear_seccion_ii()
        
        # === SECCIÓN III: Especificaciones de Extracción ===
        self._crear_seccion_iii()
        
        # === SECCIÓN IV: Registro y Validación ===
        self._crear_seccion_iv()
        
        # Botones de acción
        self._crear_botones_accion()
        
        scroll.setWidget(container)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(scroll)
    
    def _crear_seccion_i(self):
        """Sección I: Datos del Solicitante y Autorización"""
        group = QGroupBox("I. DATOS DEL SOLICITANTE Y AUTORIZACIÓN")
        group.setObjectName("sectionGroup")
        layout = QGridLayout(group)
        layout.setSpacing(15)
        
        # Nombre Completo
        layout.addWidget(QLabel("Nombre Completo:"), 0, 0)
        self.nombre = QLineEdit()
        self.nombre.setPlaceholderText("Ej: Juan Alberto Pérez García")
        layout.addWidget(self.nombre, 0, 1)
        
        # Cédula
        layout.addWidget(QLabel("Cédula / Identificación:"), 1, 0)
        cedula_layout = QHBoxLayout()
        self.cedula_prefix = QComboBox()
        self.cedula_prefix.addItems(["V", "E", "J", "G", "P"])
        self.cedula_prefix.setMaximumWidth(60)
        self.cedula = QLineEdit()
        self.cedula.setPlaceholderText("12.345.678")
        cedula_layout.addWidget(self.cedula_prefix)
        cedula_layout.addWidget(self.cedula)
        layout.addLayout(cedula_layout, 1, 1)
        
        # Ciudad
        layout.addWidget(QLabel("Ciudad:"), 2, 0)
        self.ciudad = QLineEdit()
        self.ciudad.setPlaceholderText("Ej: Caracas, Distrito Capital")
        layout.addWidget(self.ciudad, 2, 1)
        
        # Teléfono
        layout.addWidget(QLabel("Teléfono:"), 3, 0)
        telefono_layout = QHBoxLayout()
        self.telefono_carrier = QComboBox()
        self.telefono_carrier.addItems(["0414", "0412", "0416", "0424", "0426"])
        self.telefono_carrier.setMaximumWidth(80)
        self.telefono = QLineEdit()
        self.telefono.setPlaceholderText("1234567")
        self.telefono.setMaximumWidth(150)
        telefono_layout.addWidget(self.telefono_carrier)
        telefono_layout.addWidget(self.telefono)
        layout.addLayout(telefono_layout, 3, 1)
        
        # Dirección
        layout.addWidget(QLabel("Dirección Completa:"), 4, 0)
        self.direccion = QTextEdit()
        self.direccion.setMaximumHeight(60)
        self.direccion.setPlaceholderText("Av. Principal, Edif. Centro, Piso 2, Apto 24")
        layout.addWidget(self.direccion, 4, 1)
        
        # Autorización
        layout.addWidget(QLabel("Autorización:"), 5, 0)
        self.autorizacion = QCheckBox(
            "Autorizo la extracción y análisis de datos del dispositivo móvil"
        )
        layout.addWidget(self.autorizacion, 5, 1)
        
        self.main_layout.addWidget(group)
    
    def _crear_seccion_ii(self):
        """Sección II: Identificación del Dispositivo Móvil"""
        group = QGroupBox("II. IDENTIFICACIÓN DEL DISPOSITIVO MÓVIL")
        group.setObjectName("sectionGroup")
        layout = QGridLayout(group)
        layout.setSpacing(15)
        
        # Marca
        layout.addWidget(QLabel("Marca:"), 0, 0)
        self.marca = QComboBox()
        self.marca.setEditable(True)
        self.marca.addItems([
            "Samsung", "Apple", "Xiaomi", "Huawei", "Oppo", "Vivo", 
            "Motorola", "Nokia", "LG", "Google", "OnePlus", "Otro"
        ])
        layout.addWidget(self.marca, 0, 1)
        
        # Modelo
        layout.addWidget(QLabel("Modelo:"), 1, 0)
        self.modelo = QLineEdit()
        self.modelo.setPlaceholderText("Ej: Galaxy S23, iPhone 15 Pro")
        layout.addWidget(self.modelo, 1, 1)
        
        # Color
        layout.addWidget(QLabel("Color:"), 2, 0)
        self.color = QLineEdit()
        self.color.setPlaceholderText("Negro, Azul, Plata")
        layout.addWidget(self.color, 2, 1)
        
        # Serial
        layout.addWidget(QLabel("Serial de Fábrica:"), 3, 0)
        self.serial = QLineEdit()
        self.serial.setPlaceholderText("Número de serie del fabricante")
        layout.addWidget(self.serial, 3, 1)
        
        # IMEI 1
        layout.addWidget(QLabel("IMEI 1:"), 4, 0)
        self.imei1 = QLineEdit()
        self.imei1.setPlaceholderText("15 dígitos")
        self.imei1.setMaxLength(15)
        layout.addWidget(self.imei1, 4, 1)
        
        # IMEI 2
        layout.addWidget(QLabel("IMEI 2 (opcional):"), 5, 0)
        self.imei2 = QLineEdit()
        self.imei2.setPlaceholderText("15 dígitos (opcional)")
        self.imei2.setMaxLength(15)
        layout.addWidget(self.imei2, 5, 1)
        
        # Número Telefónico
        layout.addWidget(QLabel("Nº Telefónico / Operadora:"), 6, 0)
        self.num_telefonico = QLineEdit()
        self.num_telefonico.setPlaceholderText("Ej: 0412-1234567 (Movistar)")
        layout.addWidget(self.num_telefonico, 6, 1)
        
        # Estado Físico
        layout.addWidget(QLabel("Estado Físico:"), 7, 0)
        self.estado_fisico = QComboBox()
        self.estado_fisico.addItems(["Óptimo", "Bueno", "Regular", "Dañado", "Muy Dañado"])
        layout.addWidget(self.estado_fisico, 7, 1)
        
        # Código de Desbloqueo
        layout.addWidget(QLabel("Código de Desbloqueo:"), 8, 0)
        self.codigo_desbloqueo = QLineEdit()
        self.codigo_desbloqueo.setPlaceholderText("Ej: 1234 o 'Patrón en L'")
        layout.addWidget(self.codigo_desbloqueo, 8, 1)
        
        self.main_layout.addWidget(group)
    
    def _crear_seccion_iii(self):
        """Sección III: Especificaciones de la Extracción Forense"""
        group = QGroupBox("III. ESPECIFICACIONES DE LA EXTRACCIÓN FORENSE")
        group.setObjectName("sectionGroup")
        layout = QGridLayout(group)
        layout.setSpacing(15)
        
        # Aplicación Objeto
        layout.addWidget(QLabel("Aplicación Objeto:"), 0, 0)
        self.aplicacion_objeto = QComboBox()
        self.aplicacion_objeto.setEditable(True)
        self.aplicacion_objeto.addItems([
            "WhatsApp", "Telegram", "Facebook", "Instagram", "TikTok",
            "Twitter/X", "Email", "Llamadas", "SMS", "Galería", "Todas"
        ])
        layout.addWidget(self.aplicacion_objeto, 0, 1)
        
        # Contacto Específico
        layout.addWidget(QLabel("Contacto Específico:"), 1, 0)
        self.contacto_especifico = QLineEdit()
        self.contacto_especifico.setPlaceholderText("Ej: 0424-0000000")
        layout.addWidget(self.contacto_especifico, 1, 1)
        
        # Rango de Fechas
        layout.addWidget(QLabel("Rango de Fechas:"), 2, 0)
        fechas_layout = QHBoxLayout()
        self.fecha_desde = QDateEdit()
        self.fecha_desde.setCalendarPopup(True)
        self.fecha_desde.setDate(QDate.currentDate().addYears(-1))
        self.fecha_hasta = QDateEdit()
        self.fecha_hasta.setCalendarPopup(True)
        self.fecha_hasta.setDate(QDate.currentDate())
        fechas_layout.addWidget(QLabel("Desde:"))
        fechas_layout.addWidget(self.fecha_desde)
        fechas_layout.addWidget(QLabel("Hasta:"))
        fechas_layout.addWidget(self.fecha_hasta)
        fechas_layout.addStretch()
        layout.addLayout(fechas_layout, 2, 1)
        
        # Aislamiento
        layout.addWidget(QLabel("Aislamiento:"), 3, 0)
        self.aislamiento = QCheckBox(
            "Dispositivo aislado electromagnéticamente (Modo Avión + Bolsa Faraday)"
        )
        self.aislamiento.setChecked(True)
        layout.addWidget(self.aislamiento, 3, 1)
        
        # Cálculo Hash
        layout.addWidget(QLabel("Cálculo Hash:"), 4, 0)
        self.calculo_hash = QCheckBox(
            "Calcular hash SHA-256 de la evidencia digital"
        )
        self.calculo_hash.setChecked(True)
        layout.addWidget(self.calculo_hash, 4, 1)
        
        self.main_layout.addWidget(group)
    
    def _crear_seccion_iv(self):
        """Sección IV: Registro Fotográfico y Validación"""
        group = QGroupBox("IV. REGISTRO FOTOGRÁFICO Y VALIDACIÓN")
        group.setObjectName("sectionGroup")
        layout = QVBoxLayout(group)
        layout.setSpacing(15)
        
        # Fotos path
        fotos_layout = QHBoxLayout()
        fotos_layout.addWidget(QLabel("Ruta de Fotografías:"))
        self.fotos_path = QLineEdit()
        self.fotos_path.setReadOnly(True)
        self.fotos_path.setPlaceholderText("Seleccione la carpeta con las fotografías...")
        btn_examinar = QPushButton("Examinar...")
        btn_examinar.clicked.connect(self._examinar_fotos)
        fotos_layout.addWidget(self.fotos_path)
        fotos_layout.addWidget(btn_examinar)
        layout.addLayout(fotos_layout)
        
        # Observaciones
        layout.addWidget(QLabel("Observaciones:"))
        self.observaciones = QTextEdit()
        self.observaciones.setMaximumHeight(80)
        self.observaciones.setPlaceholderText("Observaciones adicionales sobre el caso...")
        layout.addWidget(self.observaciones)
        
        self.main_layout.addWidget(group)
    
    def _crear_botones_accion(self):
        """Botones de acción del formulario"""
        botones_layout = QHBoxLayout()
        botones_layout.addStretch()
        
        self.btn_guardar = QPushButton("💾 Guardar Planilla")
        self.btn_guardar.setObjectName("btnPrimary")
        self.btn_guardar.setMinimumWidth(150)
        self.btn_guardar.clicked.connect(self._guardar_planilla)
        
        self.btn_imprimir = QPushButton("🖨️ Imprimir")
        self.btn_imprimir.setObjectName("btnPrimary")
        self.btn_imprimir.setMinimumWidth(120)
        self.btn_imprimir.clicked.connect(self._imprimir_planilla)
        
        self.btn_limpiar = QPushButton("🗑️ Limpiar")
        self.btn_limpiar.setObjectName("btnDanger")
        self.btn_limpiar.setMinimumWidth(120)
        self.btn_limpiar.clicked.connect(self._limpiar_formulario)
        
        botones_layout.addWidget(self.btn_guardar)
        botones_layout.addWidget(self.btn_imprimir)
        botones_layout.addWidget(self.btn_limpiar)
        
        self.main_layout.addLayout(botones_layout)
    
    def _examinar_fotos(self):
        """Abrir diálogo para seleccionar carpeta de fotografías"""
        folder = QFileDialog.getExistingDirectory(
            self,
            "Seleccionar Carpeta de Fotografías",
            "",
            QFileDialog.Option.ShowDirsOnly
        )
        if folder:
            self.fotos_path.setText(folder)
    
    def _validar_campos(self):
        """Validar campos requeridos del formulario"""
        campos_requeridos = {
            self.nombre: "Nombre Completo",
            self.cedula: "Cédula / Identificación",
            self.ciudad: "Ciudad",
            self.direccion: "Dirección Completa",
            self.marca: "Marca del Dispositivo",
            self.modelo: "Modelo del Dispositivo",
            self.color: "Color",
            self.serial: "Serial de Fábrica",
            self.imei1: "IMEI 1",
            self.num_telefonico: "Nº Telefónico",
            self.codigo_desbloqueo: "Código de Desbloqueo",
            self.fecha_desde: "Fecha Desde",
            self.fecha_hasta: "Fecha Hasta",
        }
        
        campos_faltantes = []
        for widget, label in campos_requeridos.items():
            if isinstance(widget, QComboBox):
                if not widget.currentText().strip():
                    campos_faltantes.append(label)
            elif isinstance(widget, QLineEdit):
                if not widget.text().strip():
                    campos_faltantes.append(label)
            elif isinstance(widget, QTextEdit):
                if not widget.toPlainText().strip():
                    campos_faltantes.append(label)
            elif isinstance(widget, QDateEdit):
                if not widget.date().isValid():
                    campos_faltantes.append(label)
        
        return campos_faltantes
    
    def _guardar_planilla(self):
        """Guardar la planilla en la base de datos"""
        campos_faltantes = self._validar_campos()
        
        if campos_faltantes:
            mensaje = "Los siguientes campos son obligatorios:\n\n"
            mensaje += "\n".join(f"• {campo}" for campo in campos_faltantes)
            QMessageBox.warning(self, "Campos Requeridos", mensaje)
            return
        
        # Recopilar datos del formulario
        datos = self._recopilar_datos()
        
        # Aquí se integraría con el servicio de base de datos
        # Por ahora, mostramos un mensaje de éxito
        QMessageBox.information(
            self,
            "Planilla Guardada",
            f"Planilla guardada exitosamente.\n\nID: {datos.get('id', 'PENDIENTE')}\nSHA256: {datos.get('sha256', 'Calculando...')}"
        )
    
    def _recopilar_datos(self):
        """Recopilar todos los datos del formulario en un diccionario"""
        return {
            # Sección I
            "nombre": self.nombre.text().strip(),
            "cedula": f"{self.cedula_prefix.currentText()}-{self.cedula.text().strip()}",
            "ciudad": self.ciudad.text().strip(),
            "telefono": f"{self.telefono_carrier.currentText()}-{self.telefono.text().strip()}",
            "direccion": self.direccion.toPlainText().strip(),
            "autorizacion": self.autorizacion.isChecked(),
            
            # Sección II
            "marca": self.marca.currentText().strip(),
            "modelo": self.modelo.text().strip(),
            "color": self.color.text().strip(),
            "serial": self.serial.text().strip(),
            "imei1": self.imei1.text().strip(),
            "imei2": self.imei2.text().strip(),
            "num_telefonico": self.num_telefonico.text().strip(),
            "estado_fisico": self.estado_fisico.currentText(),
            "codigo_desbloqueo": self.codigo_desbloqueo.text().strip(),
            
            # Sección III
            "aplicacion_objeto": self.aplicacion_objeto.currentText().strip(),
            "contacto_especifico": self.contacto_especifico.text().strip(),
            "fecha_desde": self.fecha_desde.date().toString("yyyy-MM-dd"),
            "fecha_hasta": self.fecha_hasta.date().toString("yyyy-MM-dd"),
            "aislamiento": self.aislamiento.isChecked(),
            "calculo_hash": self.calculo_hash.isChecked(),
            
            # Sección IV
            "fotos_path": self.fotos_path.text().strip(),
            "observaciones": self.observaciones.toPlainText().strip(),
        }
    
    def _imprimir_planilla(self):
        """Imprimir la planilla"""
        campos_faltantes = self._validar_campos()
        
        if campos_faltantes:
            mensaje = "Debe completar todos los campos requeridos antes de imprimir."
            QMessageBox.warning(self, "Campos Requeridos", mensaje)
            return
        
        # Aquí se integraría con el servicio de impresión
        QMessageBox.information(
            self,
            "Imprimir",
            "Abriendo diálogo de impresión..."
        )
    
    def _limpiar_formulario(self):
        """Limpiar todos los campos del formulario"""
        reply = QMessageBox.question(
            self,
            "Confirmar",
            "¿Está seguro de que desea limpiar todo el formulario?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            # Sección I
            self.nombre.clear()
            self.cedula_prefix.setCurrentIndex(0)
            self.cedula.clear()
            self.ciudad.clear()
            self.telefono_carrier.setCurrentIndex(0)
            self.telefono.clear()
            self.direccion.clear()
            self.autorizacion.setChecked(False)
            
            # Sección II
            self.marca.setCurrentIndex(0)
            self.modelo.clear()
            self.color.clear()
            self.serial.clear()
            self.imei1.clear()
            self.imei2.clear()
            self.num_telefonico.clear()
            self.estado_fisico.setCurrentIndex(0)
            self.codigo_desbloqueo.clear()
            
            # Sección III
            self.aplicacion_objeto.setCurrentIndex(0)
            self.contacto_especifico.clear()
            self.fecha_desde.setDate(QDate.currentDate().addYears(-1))
            self.fecha_hasta.setDate(QDate.currentDate())
            self.aislamiento.setChecked(True)
            self.calculo_hash.setChecked(True)
            
            # Sección IV
            self.fotos_path.clear()
            self.observaciones.clear()
