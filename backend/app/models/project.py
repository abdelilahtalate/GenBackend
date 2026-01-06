from app import db
from datetime import datetime

class Project(db.Model):
    """Project model for generated backends"""
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(50), default='draft')  # draft, active, archived
    generation_mode = db.Column(db.String(50), default='manual')  # manual, ai, mixed
    api_key = db.Column(db.String(255), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    features = db.relationship('Feature', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    functions = db.relationship('CustomFunction', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    files = db.relationship('FileUpload', backref='project', lazy='dynamic')
    external_logs = db.relationship('ApiRequestLog', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'owner_id': self.owner_id,
            'status': self.status,
            'generation_mode': self.generation_mode,
            'api_key': self.api_key,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
