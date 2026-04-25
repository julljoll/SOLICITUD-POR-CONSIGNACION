from PyQt6.QtWidgets import QWidget, QVBoxLayout, QFormLayout, QLineEdit, QTextEdit, QPushButton, QLabel, QComboBox, QMessageBox
from PyQt6.QtCore import Qt
from database.db_manager import DatabaseManager
from models.caso import Caso

class FormularioCaso(QWidget):
    def __init__(self):
        super().__init__()
        self.db = DatabaseManager()
        self._init_ui()
    
    def _init_ui(self):
        self.setWindowTitle("Solicitud por Consignación - Nuevo Caso")
        self.resize(600, 500)
        
        layout = QVBoxLayout(self)
        layout.setSpacing(15)
        layout.setContentsMargins(30, 30, 30, 30)
        
        # Título
        title = QLabel("📁 REGISTRO DE NUEVO CASO")
        title.setStyleSheet("font-size: 20px; font-weight: bold; color: #90cdf4; margin-bottom: 10px;")
        layout.addWidget(title)
        
        # Formulario
        form_layout = QFormLayout()
        form_layout.setSpacing(10)
        
        self.input_numero_caso = QLineEdit()
        self.input_numero_caso.setPlaceholderText("Ej: FISCAL-2025-001")
        self.input_numero_caso.setObjectName("inputField")
        form_layout.addRow("Número de Caso:", self.input_numero_caso)
        
        self.input_fiscal = QLineEdit()
        self.input_fiscal.setPlaceholderText("Nombre del fiscal asignado")
        form_layout.addRow("Fiscal:", self.input_fiscal)
        
        self.input_fecha_inicio = QLineEdit()
        self.input_fecha_inicio.setPlaceholderText("YYYY-MM-DD")
        form_layout.addRow("Fecha de Inicio:", self.input_fecha_inicio)
        
        self.combo_estado = QComboBox()
        self.combo_estado.addItems(["activo", "suspendido", "cerrado"])
        form_layout.addRow("Estado:", self.combo_estado)
        
        layout.addLayout(form_layout)
        
        # Botones
        btn_layout = QVBoxLayout()
        btn_layout.setSpacing(10)
        
        self.btn_guardar = QPushButton("💾 Guardar Caso")
        self.btn_guardar.setObjectName("btnPrimary")
        self.btn_guardar.clicked.connect(self._guardar_caso)
        btn_layout.addWidget(self.btn_guardar)
        
        self.btn_limpiar = QPushButton("🧹 Limpiar Formulario")
        self.btn_limpiar.clicked.connect(self._limpiar_formulario)
        btn_layout.addWidget(self.btn_limpiar)
        
        layout.addLayout(btn_layout)
        
        # Espacio flexible
        layout.addStretch()
    
    def _guardar_caso(self):
        numero_caso = self.input_numero_caso.text().strip()
        fiscal = self.input_fiscal.text().strip()
        fecha_inicio = self.input_fecha_inicio.text().strip()
        estado = self.combo_estado.currentText()
        
        if not numero_caso:
            QMessageBox.warning(self, "Error", "El número de caso es obligatorio")
            return
        
        try:
            caso = Caso(
                numero_caso=numero_caso,
                fiscal=fiscal,
                fecha_inicio=fecha_inicio,
                estado=estado
            )
            
            self.db.execute(
                """INSERT INTO casos (numero_caso, fiscal, fecha_inicio, estado) 
                   VALUES (?, ?, ?, ?)""",
                (caso.numero_caso, caso.fiscal, caso.fecha_inicio, caso.estado)
            )
            
            QMessageBox.information(self, "Éxito", f"Caso {numero_caso} registrado correctamente")
            self._limpiar_formulario()
            
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Error al guardar: {str(e)}")
    
    def _limpiar_formulario(self):
        self.input_numero_caso.clear()
        self.input_fiscal.clear()
        self.input_fecha_inicio.clear()
        self.combo_estado.setCurrentIndex(0)
        self.input_numero_caso.setFocus()
    
    def closeEvent(self, event):
        self.db.close()
        event.accept()
