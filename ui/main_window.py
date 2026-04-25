from PyQt6.QtWidgets import QMainWindow, QSplitter, QStackedWidget, QWidget, QVBoxLayout, QLabel
from PyQt6.QtCore import Qt
from ui.sidebar import Sidebar
from ui.formulario_prcc import FormularioPRCC


class MainWindow(QMainWindow):
    """Ventana principal de la aplicación forense"""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Solicitud por Consignación - Laboratorio Forense")
        self.resize(1200, 800)
        self._init_ui()

    def _init_ui(self):
        self.splitter = QSplitter(Qt.Orientation.Horizontal)
        self.setCentralWidget(self.splitter)

        # Barra lateral
        self.sidebar = Sidebar()
        self.sidebar.seleccion_cambio.connect(self._cambiar_pagina)
        self.splitter.addWidget(self.sidebar)

        # Área de contenido
        self.content_area = QStackedWidget()
        self.splitter.addWidget(self.content_area)

        self.splitter.setSizes([250, 950])

        # Agregar páginas
        self._agregar_paginas()

    def _agregar_paginas(self):
        """Agregar todas las páginas al área de contenido"""
        # Página 0: Dashboard
        self._add_placeholder("📊 Dashboard del Caso")
        
        # Página 1: Aislamiento (placeholder)
        self._add_placeholder("🔒 FASE I - Aislamiento del Dispositivo")
        
        # Página 2: Adquisición (placeholder)
        self._add_placeholder("💾 FASE I - Adquisición Forense")
        
        # Página 3: PRCC - Formulario de Cadena de Custodia
        self.formulario_prcc = FormularioPRCC()
        self.content_area.addWidget(self.formulario_prcc)
        
        # Página 4: Recepción (placeholder)
        self._add_placeholder("📥 FASE II - Recepción")
        
        # Página 5: ALEAPP (placeholder)
        self._add_placeholder("📱 FASE II - ALEAPP Analysis")
        
        # Página 6: Derivación (placeholder)
        self._add_placeholder("🔄 FASE II - Derivación")
        
        # Página 7: Fundamentación (placeholder)
        self._add_placeholder("📝 FASE III - Fundamentación")
        
        # Página 8: Dictamen (placeholder)
        self._add_placeholder("📋 FASE III - Dictamen Pericial")
        
        # Página 9: Cierre (placeholder)
        self._add_placeholder("✅ FASE III - Cierre del Caso")
        
        # Página 10: Separador
        self._add_placeholder("")
        
        # Página 11: Trazabilidad (placeholder)
        self._add_placeholder("📊 Trazabilidad y Auditoría")
        
        # Página 12: Configuración (placeholder)
        self._add_placeholder("⚙️ Configuración del Sistema")

    def _add_placeholder(self, text):
        """Agregar una página con placeholder"""
        w = QWidget()
        l = QVBoxLayout(w)
        if text:
            lbl = QLabel(text)
            lbl.setStyleSheet("color: #a0aec0; font-size: 24px;")
            lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
            l.addWidget(lbl)
        self.content_area.addWidget(w)
    
    def _cambiar_pagina(self, indice: int):
        """Cambiar a la página seleccionada en el sidebar"""
        item_text = self.sidebar.get_item_text(indice)
        
        # Ignorar separadores
        if item_text.startswith("──") or item_text.startswith("─"):
            return
        
        self.content_area.setCurrentIndex(indice)
