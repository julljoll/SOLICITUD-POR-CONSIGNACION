from dataclasses import dataclass
from typing import Optional

@dataclass
class PRCC:
    id: Optional[int] = None
    caso_id: Optional[int] = None
    numero_prcc: str = ""
    tipo: str = "principal"
    funcionario_colector: str = ""
    cargo: str = ""
    organo: str = ""
    tipo_embalaje: str = ""
    numero_precinto: str = ""
    hash_sha256: str = ""
    hash_md5: str = ""
    estado_embalaje: str = ""
    nombre_firmante: str = ""
    fecha_creacion: str = ""
