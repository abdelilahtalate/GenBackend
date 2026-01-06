import sys
import os
import zipfile
import io

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app.services.generator_service import GeneratorService

def verify_gen():
    project_info = {'name': 'AuthTest'}
    features = [
        {
            'name': 'Auth',
            'feature_type': 'AUTH',
            'config': {'auth_type': 'jwt'}
        },
        {
            'name': 'Items',
            'feature_type': 'CRUD',
            'config': {
                'table': 'items',
                'fields': [{'name': 'title', 'type': 'string'}]
            }
        }
    ]
    
    zip_bytes = GeneratorService.generate_project(project_info, features)
    with zipfile.ZipFile(zip_bytes, 'r') as zf:
        files = zf.namelist()
        print(f"Files in ZIP: {files}")
        
        # Check requirements
        reqs = zf.read('requirements.txt').decode('utf-8')
        print(f"\n--- Requirements ---\n{reqs}")
        assert 'Flask-JWT-Extended' in reqs
        assert 'bcrypt' in reqs
        
        # Check models
        models = zf.read('app/models.py').decode('utf-8')
        print(f"\n--- Models ---\n{models}")
        assert 'class User' in models
        assert 'owner_id = db.Column(db.Integer, db.ForeignKey(\'users.id\'))' in models
        
        # Check routes
        routes = zf.read('app/routes.py').decode('utf-8')
        print(f"\n--- Routes ---\n{routes}")
        assert '@main.route(\'/auth/login\'' in routes
        assert '@jwt_required()' in routes
        assert 'owner_id=get_jwt_identity()' in routes
        
    print("\nVerification SUCCESSFUL!")

if __name__ == "__main__":
    verify_gen()
