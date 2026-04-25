from PyQt6.QtCore import QProcess, pyqtSignal, QObject

class AleappService(QObject):
    output_line = pyqtSignal(str)
    finished = pyqtSignal(int)

    def __init__(self):
        super().__init__()
        self._proc = QProcess(self)
        self._proc.readyReadStandardOutput.connect(self._on_stdout)
        self._proc.readyReadStandardError.connect(self._on_stderr)
        self._proc.finished.connect(self.finished)

    def iniciar(self, aleapp_bin: str, ruta_imagen: str, ruta_salida: str):
        args = ["-t", "fs", "-i", ruta_imagen, "-o", ruta_salida]
        self._proc.start(aleapp_bin, args)

    def _on_stdout(self):
        data = self._proc.readAllStandardOutput().data().decode(errors="replace")
        for line in data.splitlines():
            self.output_line.emit(line)

    def _on_stderr(self):
        data = self._proc.readAllStandardError().data().decode(errors="replace")
        for line in data.splitlines():
            self.output_line.emit(f"[ERR] {line}")

    def cancelar(self):
        self._proc.terminate()
