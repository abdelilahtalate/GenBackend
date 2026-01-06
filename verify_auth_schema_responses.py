import sys
import os
import json

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app import create_app, db
from backend.app.services.features.auth import AuthHandler

def verify_auth_response():
    app = create_app('testing')
    with app.app_context():
        # Ensure tables exist for test
        db.create_all()
        
        handler = AuthHandler()
        
        # Define a custom schema with specific fields
        schema = {
            "auth_type": "jwt",
            "extra_fields": [
                {"name": "phone", "type": "string"},
                {"name": "full_name", "type": "string"}
            ]
        }
        
        # Test registration with custom fields
        body = {
            "email": "strict@test.com",
            "password": "pass",
            "phone": "555-0000",
            "full_name": "Strict Response User"
        }
        
        res, status = handler.handle('POST', '/api/auth/register', body, schema, context={'user_id': 1001})
        print(f"Register Response (Status {status}):\n{json.dumps(res, indent=2)}")
        
        assert status == 201
        user = res['user']
        # Check for requested fields
        assert 'phone' in user
        assert 'full_name' in user
        # Check for standard fields
        assert 'id' in user
        assert 'email' in user
        assert 'created_at' in user
        # Check for EXCLUDED fields (the point of this task)
        assert 'first_name' not in user
        assert 'last_name' not in user
        
        # Test profile retrieval
        res_p, status_p = handler.handle('GET', '/api/auth/me', {}, schema, context={'user_id': 1001})
        print(f"\nMe Response (Status {status_p}):\n{json.dumps(res_p, indent=2)}")
        
        assert status_p == 200
        user_p = res_p['user']
        assert user_p['phone'] == "555-0000"
        assert 'first_name' not in user_p
        
        print("\nVerification SUCCESSFUL! Test responses are now strictly schema-driven.")

if __name__ == "__main__":
    verify_auth_response()
