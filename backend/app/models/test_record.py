from app import db
from datetime import datetime

class TestRecord(db.Model):
    """
    Model for storing test data during the wizard session.
    Allows persistent testing of features without creating real tables.
    """
    __tablename__ = 'test_records'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.String(36), nullable=False, index=True) # ID of the project in the wizard
    feature_id = db.Column(db.String(36), nullable=False, index=True) # Using UUID string for feature_id from frontend
    data = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'feature_id': self.feature_id,
            'data': self.data,
            'created_at': self.created_at.isoformat()
        }
