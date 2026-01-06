import requests
import json
import random
import string
import time

BASE_URL = "http://localhost:5000/api"

def get_random_string(length=10):
    return ''.join(random.choice(string.ascii_lowercase) for i in range(length))

def run_test():
    session = requests.Session()
    
    # 1. Register User
    email = f"final_{get_random_string()}@test.com"
    password = "password123"
    print(f"Registering user: {email}")
    
    res = session.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password
    })
    
    if res.status_code == 200 or res.status_code == 201:
        token = res.json().get('token') or res.json().get('access_token')
        headers = {"Authorization": f"Bearer {token}"}
        print("Logged in.")
    else:
        print(f"Login failed: {res.text}")
        return

    # 2. Create Project
    print("Creating Project...")
    res = session.post(f"{BASE_URL}/projects", json={
        "name": f"FinalSync_{get_random_string()}",
        "description": "Test Project",
        "generation_mode": "chat"
    }, headers=headers)
    
    if res.status_code != 201:
        print(f"Create project failed: {res.text}")
        return
        
    project_id = res.json()['project']['id']
    print(f"Project Created: {project_id}")

    # 3. Create Feature (CRUD)
    print("Creating CRUD Feature...")
    res = session.post(f"{BASE_URL}/features", json={
        "project_id": project_id,
        "name": "Note",
        "feature_type": "CRUD",
        "configuration": {
            "table": "note",
            "fields": [{"name": "text", "type": "string"}]
        }
    }, headers=headers)
    
    if res.status_code != 201:
        print(f"Create feature failed: {res.text}")
        return
        
    feature_id = res.json()['feature']['id']
    print(f"Feature Created: {feature_id}")

    # 4. Sync from Files (Simulate Edit adding 'priority')
    print("Syncing modified file...")
    crud_file_content = """
from app import db
from datetime import datetime

class Note(db.Model):
    __tablename__ = 'note'
    
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(120), nullable=False)
    
    # New Field
    priority = db.Column(db.Integer)

"""
    
    res = session.post(f"{BASE_URL}/projects/{project_id}/sync-from-files", json={
        "files": {
            "app/models/crud.py": crud_file_content
        }
    }, headers=headers)
    
    print(f"Sync Result: {res.text}")
    
    # 5. Verify Feature Config
    print("Verifying Update...")
    time.sleep(1) # Give DB a moment
    res = session.get(f"{BASE_URL}/features/project/{project_id}", headers=headers)
    features = res.json().get('features', [])
    
    note_feature = next((f for f in features if f['name'] == "Note"), None)
    if not note_feature:
         print("Feature Note not found?")
         return

    fields = note_feature.get('configuration', {}).get('fields', [])
    print(f"Current Fields: {fields}")
    
    priority_field = next((f for f in fields if f['name'] == 'priority'), None)
    
    if priority_field:
        print("SUCCESS! Found 'priority' field in feature configuration.")
    else:
        print("FAILURE! 'priority' field missing.")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"Test Error: {e}")
