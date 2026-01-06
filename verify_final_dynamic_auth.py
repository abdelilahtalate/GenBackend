import sys
import os
import io
import zipfile
import json

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app import create_app, db
from backend.app.services.generator_service import GeneratorService
from backend.app.services.features.auth import AuthHandler

def verify_all_dynamic_auth():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        
        # 1. Verify Test Handler (AuthHandler)
        handler = AuthHandler()
        schema = {
            "auth_type": "jwt",
            "extra_fields": [
                {"name": "username", "type": "string", "required": True},
                {"name": "full_name", "type": "string"}
            ]
        }
        
        # Test Registration in test env
        reg_body = {
            "email": "dynamic@test.com",
            "password": "pass",
            "username": "tester123",
            "full_name": "Dynamic Tester"
        }
        res, status = handler.handle('POST', '/api/auth/register', reg_body, schema, context={'user_id': 2000})
        print(f"Test Env Register Status: {status}")
        assert status == 201
        assert res['user']['username'] == "tester123"
        
        # Test Login by Username in test env
        login_body = {
            "username": "tester123",
            "password": "pass"
        }
        res_l, status_l = handler.handle('POST', '/api/auth/login', login_body, schema, context={'user_id': 2000})
        print(f"Test Env Login Status (by username): {status_l}")
        assert status_l == 200
        assert res_l['user']['email'] == "dynamic@test.com"
        
        # 2. Verify Generator Service
        project_info = {"name": "Test Modular"}
        features = [{"type": "AUTH", "config": schema}]
        
        zip_buffer = GeneratorService.generate_project(project_info, features)
        with zipfile.ZipFile(zip_buffer, 'r') as zf:
            # Check User Model
            user_model = zf.read('app/models/user.py').decode('utf-8')
            assert "username = db.Column(db.String(120), unique=True, nullable=False)" in user_model
            
            # Check Auth Routes
            auth_routes = zf.read('app/routes/auth.py').decode('utf-8')
            assert "if 'username' in data: user.username = data['username']" in auth_routes
            assert "User.query.filter((User.email == data.get('email')) | (User.username == data.get('username'))).first()" in auth_routes

        print("\nALL VERIFICATIONS PASSED!")

if __name__ == "__main__":
    verify_all_dynamic_auth()
