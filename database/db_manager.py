import sqlite3
import os
import logging

class DatabaseManager:
    def __init__(self, db_path="~/.local/share/forense-android/casos.db"):
        self.db_path = os.path.expanduser(db_path)
        self._ensure_db_dir()
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self._initialize_schema()

    def _ensure_db_dir(self):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)

    def _initialize_schema(self):
        # Asumimos que el esquema esta al lado de este archivo
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        if not os.path.exists(schema_path):
            logging.error(f"Archivo de esquema no encontrado: {schema_path}")
            return
        
        with open(schema_path, 'r') as f:
            schema_script = f.read()
        
        try:
            self.conn.executescript(schema_script)
            self.conn.commit()
        except sqlite3.Error as e:
            logging.error(f"Error al inicializar el esquema de base de datos: {e}")

    def execute(self, query, params=()):
        cursor = self.conn.cursor()
        try:
            cursor.execute(query, params)
            self.conn.commit()
            return cursor
        except sqlite3.Error as e:
            logging.error(f"Error ejecutando query: {query} - params: {params} - err: {e}")
            self.conn.rollback()
            raise

    def fetchall(self, query, params=()):
        cursor = self.execute(query, params)
        return cursor.fetchall()

    def fetchone(self, query, params=()):
        cursor = self.execute(query, params)
        return cursor.fetchone()

    def close(self):
        self.conn.close()
