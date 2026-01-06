from app import db
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Text, Float, Boolean, DateTime
from datetime import datetime

class CRUDService:
    """Dynamic CRUD table generation - MANUAL, AI, or MIXED"""
    
    @staticmethod
    def create_table_from_schema(table_name: str, schema: dict) -> dict:
        """Create database table from schema - MANUAL or AI-GENERATED"""
        try:
            # Validate schema
            if not schema.get('columns'):
                return {'error': 'Schema must have columns'}, 400
            
            # Build SQLAlchemy columns
            columns = []
            for col_def in schema['columns']:
                col_name = col_def.get('name')
                col_type = col_def.get('type', 'string')
                col_nullable = col_def.get('nullable', True)
                col_default = col_def.get('default')
                
                # Map to SQLAlchemy types
                type_mapping = {
                    'string': String(255),
                    'text': Text,
                    'integer': Integer,
                    'float': Float,
                    'boolean': Boolean,
                    'datetime': DateTime
                }
                
                sqlalchemy_type = type_mapping.get(col_type, String(255))
                column = Column(col_name, sqlalchemy_type, nullable=col_nullable)
                columns.append(column)
            
            # Add metadata
            metadata = MetaData()
            table = Table(table_name, metadata, *columns)
            
            # Create table
            metadata.create_all(db.engine)
            
            return {'message': f'Table {table_name} created', 'schema': schema}, 201
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def insert_record(table_name: str, data: dict) -> dict:
        """Insert record - MANUAL"""
        try:
            query = f"INSERT INTO {table_name} ({', '.join(data.keys())}) VALUES ({', '.join(['%s'] * len(data))})"
            db.session.execute(query, list(data.values()))
            db.session.commit()
            return {'message': 'Record inserted'}, 201
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_records(table_name: str, limit=50, offset=0) -> dict:
        """Get records - MANUAL"""
        try:
            query = f"SELECT * FROM {table_name} LIMIT {limit} OFFSET {offset}"
            result = db.session.execute(query)
            records = result.fetchall()
            return {'records': records, 'total': len(records)}, 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_record(table_name: str, record_id: int, data: dict) -> dict:
        """Update record - MANUAL"""
        try:
            set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
            query = f"UPDATE {table_name} SET {set_clause} WHERE id = %s"
            values = list(data.values()) + [record_id]
            db.session.execute(query, values)
            db.session.commit()
            return {'message': 'Record updated'}, 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_record(table_name: str, record_id: int) -> dict:
        """Delete record - MANUAL"""
        try:
            query = f"DELETE FROM {table_name} WHERE id = %s"
            db.session.execute(query, [record_id])
            db.session.commit()
            return {'message': 'Record deleted'}, 200
        except Exception as e:
            return {'error': str(e)}, 500
