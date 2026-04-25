from PyQt6.QtCore import QProcess, pyqtSignal, QObject

class AndrillerService(QObject):
    output_line = pyqtSignal(str)
    finished = pyqtSignal(int)  # exit code

    def __init__(self):
        super().__init__()
        self._proc = QProcess(self)
        self._proc.readyReadStandardOutput.connect(self._on_stdout)
        self._proc.readyReadStandardError.connect(self._on_stderr)
        self._proc.finished.connect(self.finished)

    def iniciar(self, andriller_bin: str, ruta_salida: str, modo: str):
        args = ["--output", ruta_salida, "--mode", modo]
        self._proc.start(andriller_bin, args)

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
