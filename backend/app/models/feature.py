from app import db
from datetime import datetime
import json

class Feature(db.Model):
    """Feature model (Auth, CRUD, Analytics, etc.)"""
    __tablename__ = 'features'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)  # auth, crud, analytics, files, tasks, ai
    feature_type = db.Column(db.String(50), nullable=False)
    generation_mode = db.Column(db.String(50), default='manual')  # manual, ai, mixed
    configuration = db.Column(db.JSON, default={})  # stores feature-specific config
    schema_definition = db.Column(db.JSON, default={})  # for CRUD tables
    is_enabled = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'feature_type': self.feature_type,
            'generation_mode': self.generation_mode,
            'configuration': self.configuration,
            'schema_definition': self.schema_definition,
            'is_enabled': self.is_enabled,
            'created_at': self.created_at.isoformat()
        }
