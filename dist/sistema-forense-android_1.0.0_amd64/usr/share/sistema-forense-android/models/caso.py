from dataclasses import dataclass
from typing import Optional

@dataclass
class Caso:
    id: Optional[int] = None
    numero_caso: str = ""
    fiscal: str = ""
    fecha_inicio: str = ""
    estado: str = "activo"
    paso_actual: int = 1
