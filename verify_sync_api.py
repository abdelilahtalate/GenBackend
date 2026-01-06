import requests
import json
import random
import string

BASE_URL = "http://localhost:5000/api"

def get_random_string(length=10):
    return ''.join(random.choice(string.ascii_lowercase) for i in range(length))

def run_test():
    session = requests.Session()
    
    # 1. Register User
    email = f"test_{get_random_string()}@test.com"
    password = "password123"
    print(f"Registering user: {email}")
    
    # We might need to handle if auth is not enabled globally, but usually there's a dev login or similar.
    # Assuming standard auth route exists or we can use a token if printed by server.
    # Wait, the `run.py` server might be running the *generated* code or the *generator* backend?
    # The user is working on `backendGen2`. The `run.py` in `backend` folder is likely the Generator Backend.
    # The Generator Backend has `app/routes/auth.py`?
    # Let's check `backend/app/routes/__init__.py`.
    
    # Looking at file list, `backend/app/routes/auth.py` exists (implied by `services/features/auth.py`).
    # Actually, `backend/app/routes/auth.py` does NOT exist in the file list I saw earlier (only `projects.py`, `features.py`, `ai.py` etc).
    # Ah, `backend/app/routes/auth.py` was NOT in the open files list, but `services/features/auth.py` was.
    # The Generator Backend uses `projects`, `features`, `ai`. It likely has its own Auth.
    
    # Let's assume we can register.
    res = session.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password
    })
    
    if res.status_code != 201 and res.status_code != 200:
        # Maybe login endpoint?
        print(f"Register failed: {res.text}. Trying login...")
        res = session.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        
    if res.status_code == 200 or res.status_code == 201:
        token = res.json().get('token') or res.json().get('access_token')
        headers = {"Authorization": f"Bearer {token}"}
        print("Logged in.")
    else:
        print("Could not log in/register. Skipping test.")
        return

    # 2. Create Project
    print("Creating Project...")
    res = session.post(f"{BASE_URL}/projects", json={
        "name": f"SyncTest_{get_random_string()}",
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
        "name": "Book",
        "feature_type": "CRUD",
        "configuration": {
            "table": "book",
            "fields": [{"name": "title", "type": "string"}]
        }
    }, headers=headers)
    
    if res.status_code != 201:
        print(f"Create feature failed: {res.text}")
        return
        
    feature_id = res.json()['feature']['id']
    print(f"Feature Created: {feature_id}")

    # 4. Sync from Files (Simulate Edit)
    print("Syncing modified file...")
    crud_file_content = """
from app import db

class Book(db.Model):
    __tablename__ = 'book'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    
    # New Field
    rating = db.Column(db.Integer)
"""
    
    res = session.post(f"{BASE_URL}/projects/{project_id}/sync-from-files", json={
        "files": {
            "app/models/crud.py": crud_file_content
        }
    }, headers=headers)
    
    print(f"Sync Result: {res.text}")
    
    # 5. Verify Feature Config
    print("Verifying Update...")
    res = session.get(f"{BASE_URL}/features/project/{project_id}", headers=headers)
    features = res.json().get('features', [])
    
    book_feature = next((f for f in features if f['name'] == "Book"), None)
    fields = book_feature.get('configuration', {}).get('fields', [])
    
    rating_field = next((f for f in fields if f['name'] == 'rating'), None)
    
    if rating_field:
        print("SUCCESS! Found 'rating' field in feature configuration.")
        print(rating_field)
    else:
        print("FAILURE! 'rating' field missing.")
        print(fields)

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"Test Error: {e}")
