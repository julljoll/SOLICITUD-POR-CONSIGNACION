from PyQt6.QtWidgets import QWidget, QVBoxLayout, QListWidget, QLabel, QListWidgetItem
from PyQt6.QtCore import Qt, pyqtSignal

class Sidebar(QWidget):
    """Barra lateral de navegación del proceso forense"""
    
    seleccion_cambio = pyqtSignal(int)  # Señal cuando cambia la selección
    
    def __init__(self):
        super().__init__()
        self.setObjectName("sidebar")
        self._init_ui()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        
        title = QLabel("PROCESO FORENSE")
        title.setObjectName("sectionTitle")
        layout.addWidget(title)

        self.list_widget = QListWidget()
        self.list_widget.currentRowChanged.connect(self._on_selection_change)
        layout.addWidget(self.list_widget)

        items = [
            "📁 Caso Activo",
            "── FASE I ──",
            "🔘 1. Aislamiento",
            "🔘 2. Adquisición",
            "🔘 3. Cadena Custodia (PRCC)",
            "── FASE II ──",
            "🔘 4. Recepción",
            "🔘 5. ALEAPP",
            "🔘 6. Derivación",
            "── FASE III ──",
            "🔘 7. Fundamentación",
            "🔘 8. Dictamen",
            "🔘 9. Cierre",
            "────────────────",
            "📊 Trazabilidad",
            "⚙️ Configuración"
        ]

        for idx, text in enumerate(items):
            item = QListWidgetItem(text)
            self.list_widget.addItem(item)
            
            # Deshabilitar separadores
            if text.startswith("──") or text.startswith("─"):
                item.setFlags(item.flags() & ~Qt.ItemFlag.ItemIsSelectable)
            else:
                # Marcar el primer elemento como seleccionado por defecto
                if idx == 0:
                    self.list_widget.setCurrentItem(item)
    
    def _on_selection_change(self, row: int):
        """Emitir señal cuando cambia la selección"""
        if row >= 0:
            self.seleccion_cambio.emit(row)
    
    def get_item_text(self, row: int) -> str:
        """Obtener el texto de un elemento por índice"""
        item = self.list_widget.item(row)
        return item.text() if item else ""
