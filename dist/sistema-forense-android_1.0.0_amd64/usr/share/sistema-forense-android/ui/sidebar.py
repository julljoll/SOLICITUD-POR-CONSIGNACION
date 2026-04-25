from PyQt6.QtWidgets import QWidget, QVBoxLayout, QListWidget, QLabel, QListWidgetItem
from PyQt6.QtCore import Qt

class Sidebar(QWidget):
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
        layout.addWidget(self.list_widget)

        items = [
            "📁 Caso Activo",
            "── FASE I ──",
            "🔘 1. Aislamiento",
            "🔘 2. Adquisición",
            "🔘 3. Cadena Custodia",
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

        for text in items:
            item = QListWidgetItem(text)
            self.list_widget.addItem(item)
            
            # Deshabilitar separadores
            if text.startswith("──") or text.startswith("─"):
                item.setFlags(item.flags() & ~Qt.ItemFlag.ItemIsSelectable)
