from PyQt6.QtWidgets import QMainWindow, QSplitter, QStackedWidget, QWidget, QVBoxLayout, QLabel
from PyQt6.QtCore import Qt
from ui.sidebar import Sidebar

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Solicitud por Consignación")
        self.resize(1200, 800)
        self._init_ui()

    def _init_ui(self):
        self.splitter = QSplitter(Qt.Orientation.Horizontal)
        self.setCentralWidget(self.splitter)

        self.sidebar = Sidebar()
        self.splitter.addWidget(self.sidebar)

        self.content_area = QStackedWidget()
        self.splitter.addWidget(self.content_area)

        self.splitter.setSizes([250, 950])

        # Placeholder para home page
        self._add_placeholder("Dashboard del Caso")

    def _add_placeholder(self, text):
        w = QWidget()
        l = QVBoxLayout(w)
        lbl = QLabel(text)
        lbl.setStyleSheet("color: white; font-size: 24px;")
        lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        l.addWidget(lbl)
        self.content_area.addWidget(w)
