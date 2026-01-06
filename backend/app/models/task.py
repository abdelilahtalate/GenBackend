from app import db
from datetime import datetime

class BackgroundTask(db.Model):
    """Background task/job model"""
    __tablename__ = 'background_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=True)
    task_type = db.Column(db.String(100), nullable=False)  # email, data_processing, etc.
    task_name = db.Column(db.String(255))
    status = db.Column(db.String(50), default='pending')  # pending, running, completed, failed
    payload = db.Column(db.JSON)  # Task input data
    result = db.Column(db.JSON)  # Task output result
    error_message = db.Column(db.Text)
    scheduled_for = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'task_type': self.task_type,
            'task_name': self.task_name,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
