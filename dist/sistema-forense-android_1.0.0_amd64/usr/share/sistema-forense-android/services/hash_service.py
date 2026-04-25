import hashlib
from pathlib import Path
from typing import Callable, Optional

def calcular_hash_archivo(
    ruta: str,
    algoritmo: str = "sha256",
    progreso_cb: Optional[Callable[[int], None]] = None
) -> str:
    """
    Lee el archivo en bloques de 64KB para no saturar RAM.
    Llama progreso_cb(porcentaje) si se provee.
    """
    h = hashlib.new(algoritmo)
    p = Path(ruta)
    if not p.exists():
        raise FileNotFoundError(f"Archivo no encontrado: {ruta}")
        
    tamano = p.stat().st_size
    leido = 0
    BLOQUE = 65536
    with open(ruta, "rb") as f:
        while chunk := f.read(BLOQUE):
            h.update(chunk)
            leido += len(chunk)
            if progreso_cb and tamano > 0:
                progreso_cb(int(leido * 100 / tamano))
    return h.hexdigest()
