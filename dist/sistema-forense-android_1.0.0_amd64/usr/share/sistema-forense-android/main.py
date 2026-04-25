import sys
import logging
from PyQt6.QtWidgets import QApplication
from ui.main_window import MainWindow

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def main():
    app = QApplication(sys.argv)
    
    # Cargar estilos
    try:
        with open("assets/style.qss", "r") as f:
            app.setStyleSheet(f.read())
    except FileNotFoundError:
        logging.warning("Archivo de estilos 'assets/style.qss' no encontrado.")
        
    window = MainWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
