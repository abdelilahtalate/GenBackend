from app import db
from datetime import datetime

class CustomFunction(db.Model):
    """Custom function/business logic model"""
    __tablename__ = 'custom_functions'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    function_code = db.Column(db.Text)  # Manual code or AI-generated
    input_schema = db.Column(db.JSON)  # Input validation schema
    output_schema = db.Column(db.JSON)  # Output schema
    generation_mode = db.Column(db.String(50), default='manual')  # manual, ai, mixed
    endpoint_path = db.Column(db.String(255), unique=True)
    http_method = db.Column(db.String(10), default='POST')  # GET, POST, PUT, DELETE
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'input_schema': self.input_schema,
            'output_schema': self.output_schema,
            'generation_mode': self.generation_mode,
            'endpoint_path': self.endpoint_path,
            'http_method': self.http_method,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }
