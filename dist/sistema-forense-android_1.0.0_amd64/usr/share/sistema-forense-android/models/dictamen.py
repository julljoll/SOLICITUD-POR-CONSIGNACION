from dataclasses import dataclass
from typing import Optional

@dataclass
class Dictamen:
    id: Optional[int] = None
    caso_id: Optional[int] = None
    numero_dictamen: str = ""
    motivo: str = ""
    descripcion: str = ""
    examenes_practicados: str = ""
    resultados_json: str = "{}"
    conclusiones: str = ""
    consumo_evidencia: str = ""
    perito: str = ""
    credencial: str = ""
    fecha_emision: str = ""
