import sys
import os
import random
import string

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import create_app, db
from app.models import User, Project, Feature
from app.services.project_service import ProjectService
import json

app = create_app()

def get_random_string(length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_sync_crud():
    with app.app_context():
        print("Testing CRUD Sync...")
        # 1. Setup Data
        # clean id=999
        Project.query.filter_by(id=999).delete()
        User.query.filter_by(id=999).delete()
        db.session.commit()

        email = f"test_{get_random_string()}@test.com"
        user = User(id=999, email=email, password_hash="hash")
        db.session.add(user)
        db.session.commit()

        project = Project(id=999, name="SyncTest", owner_id=999, generation_mode="chat")
        db.session.add(project)
        db.session.commit()

        # Create CRUD feature
        crud_config = {
            "table": "book",
            "fields": [
                {"name": "title", "type": "string", "required": True}
            ]
        }
        feature = Feature(project_id=999, name="Book", feature_type="CRUD", configuration=crud_config)
        db.session.add(feature)
        db.session.commit()

        # 2. Simulate File Content with NEW field (rating)
        # Note: In real app this comes from file read, here we simulate the string
        crud_file_content = """
from app import db
from datetime import datetime

class Book(db.Model):
    __tablename__ = 'book'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    title = db.Column(db.String(120), nullable=False)
    # This is the new field
    rating = db.Column(db.Integer)

    def to_dict(self):
        return {}
"""

        files = {
            'app/models/crud.py': crud_file_content
        }

        # 3. Request Sync
        ProjectService.sync_from_files(999, 999, files)

        # 4. Verify
        updated_feature = Feature.query.filter_by(project_id=999, name="Book").first()
        fields = updated_feature.configuration.get('fields', [])
        
        rating_field = next((f for f in fields if f['name'] == 'rating'), None)
        
        if rating_field:
            print("SUCCESS: Found 'rating' field in configuration!")
            print(f"Details: {rating_field}")
        else:
            print("FAILURE: 'rating' field NOT found in configuration.")
            print("Current fields:", fields)

        # Cleanup
        db.session.delete(updated_feature)
        db.session.delete(project)
        db.session.delete(user)
        db.session.commit()

def test_sync_auth():
    with app.app_context():
        print("\nTesting Auth Sync...")
        # 1. Setup Data
        Project.query.filter_by(id=998).delete()
        User.query.filter_by(id=998).delete()
        db.session.commit()

        email = f"auth_{get_random_string()}@test.com"
        user = User(id=998, email=email, password_hash="hash")
        db.session.add(user)
        db.session.commit() # commit user first
        
        project = Project(id=998, name="AuthTest", owner_id=998, generation_mode="chat")
        db.session.add(project)
        db.session.commit()
        
        # Create Auth feature
        auth_config = {
            "features": {"email_password": True},
            "extra_fields": []
        }
        feature = Feature(project_id=998, name="Auth", feature_type="AUTH", configuration=auth_config)
        db.session.add(feature)
        db.session.commit()

        # 2. Simulate User Model with EXTRA field (phone)
        user_file_content = """
from app import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime)
    
    # New Field
    phone = db.Column(db.String(20))
    
"""
        files = {
            'app/models/user.py': user_file_content
        }

        # 3. Request Sync
        ProjectService.sync_from_files(998, 998, files)

        # 4. Verify
        updated_feature = Feature.query.filter_by(project_id=998, name="Auth").first()
        extra_fields = updated_feature.configuration.get('extra_fields', [])
        
        phone_field = next((f for f in extra_fields if f['name'] == 'phone'), None)
        
        if phone_field:
            print("SUCCESS: Found 'phone' field in Auth configuration!")
            print(f"Details: {phone_field}")
        else:
            print("FAILURE: 'phone' field NOT found in configuration.")
            print("Current extra fields:", extra_fields)

        # Cleanup
        db.session.delete(updated_feature)
        db.session.delete(project)
        db.session.delete(user)
        db.session.commit()

if __name__ == "__main__":
    try:
        test_sync_crud()
        test_sync_auth()
    except Exception as e:
        print(f"An error occurred: {e}")
