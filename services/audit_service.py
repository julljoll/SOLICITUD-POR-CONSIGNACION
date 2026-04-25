import hashlib
from datetime import datetime, timezone
from database.db_manager import DatabaseManager

class AuditService:
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager

    def log_action(self, caso_id: int, fase: int, paso: int, accion: str, usuario: str):
        fecha = datetime.now(timezone.utc).isoformat()
        
        # Obtener hash_previo del ultimo registro
        cursor = self.db.execute("SELECT hash_actual FROM audit_log ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
        hash_previo = row["hash_actual"] if row else "0" * 64
        
        # Calcular hash_actual
        # SHA-256(fase||paso||accion||usuario||fecha||hash_previo)
        datos_concat = f"{fase}{paso}{accion}{usuario}{fecha}{hash_previo}"
        hash_actual = hashlib.sha256(datos_concat.encode('utf-8')).hexdigest()
        
        # Insertar
        query = """
        INSERT INTO audit_log (caso_id, fase, paso, accion, usuario, fecha, hash_previo, hash_actual)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        self.db.execute(query, (caso_id, fase, paso, accion, usuario, fecha, hash_previo, hash_actual))
