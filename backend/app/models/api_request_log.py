from app import db
from datetime import datetime

class ApiRequestLog(db.Model):
    """
    Model for logging external API requests made via API keys.
    Used for analytics and usage tracking.
    """
    __tablename__ = 'api_request_logs'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False, index=True)
    feature_id = db.Column(db.Integer, db.ForeignKey('features.id'), nullable=True, index=True)
    method = db.Column(db.String(10), nullable=False)
    path = db.Column(db.String(255), nullable=False)
    status_code = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'feature_id': self.feature_id,
            'method': self.method,
            'path': self.path,
            'status_code': self.status_code,
            'created_at': self.created_at.isoformat()
        }
