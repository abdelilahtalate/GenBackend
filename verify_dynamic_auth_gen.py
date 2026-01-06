import sys
import os
import io
import zipfile

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app.services.generator_service import GeneratorService

def verify_dynamic_auth_gen():
    project_info = {"name": "Test Dynamic Auth"}
    features = [
        {
            "type": "AUTH",
            "name": "User Auth",
            "config": {
                "auth_type": "jwt",
                "extra_fields": [
                    {"name": "username", "type": "string", "required": True},
                    {"name": "phone", "type": "string", "required": False}
                ]
            }
        }
    ]
    
    zip_buffer = GeneratorService.generate_project(project_info, features)
    
    with zipfile.ZipFile(zip_buffer, 'r') as zf:
        # Check User Model
        user_model = zf.read('app/models/user.py').decode('utf-8')
        print("--- Generated User Model ---")
        print(user_model)
        
        assert "username = db.Column(db.String(120), nullable=False)" in user_model
        assert "phone = db.Column(db.String(120))" in user_model
        assert "data['username'] = self.username" in user_model
        assert "data['phone'] = self.phone" in user_model
        
        # Check Auth Routes
        auth_routes = zf.read('app/routes/auth.py').decode('utf-8')
        print("\n--- Generated Auth Routes ---")
        print(auth_routes)
        
        assert "if 'username' in data: user.username = data['username']" in auth_routes
        assert "if 'phone' in data: user.phone = data['phone']" in auth_routes
        
    print("\nVerification SUCCESSFUL! Dynamic Auth code generation works as expected.")

if __name__ == "__main__":
    verify_dynamic_auth_gen()
