from dataclasses import dataclass
from typing import Optional, List
import json

@dataclass
class Dispositivo:
    id: Optional[int] = None
    caso_id: Optional[int] = None
    marca: str = ""
    modelo: str = ""
    imei: str = ""
    sim_card: str = ""
    numero_tel: str = ""
    estado_fisico: str = ""
    modo_aislamiento: str = ""
    fotos_path: str = "[]"  # JSON string list
    fecha_fijacion: str = ""

    def get_fotos(self) -> List[str]:
        try:
            return json.loads(self.fotos_path)
        except json.JSONDecodeError:
            return []

    def set_fotos(self, fotos: List[str]):
        self.fotos_path = json.dumps(fotos)
