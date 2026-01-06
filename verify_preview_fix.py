import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.generator_service import GeneratorService
import json

project_info = {"name": "Test Project", "description": "A test project"}
features = [
    {
        "name": "Auth",
        "type": "AUTH",
        "config": {
            "auth_type": "jwt",
            "providers": ["email"],
            "extra_fields": ["phone", "address"]
        }
    },
    {
        "name": "Products",
        "type": "CRUD",
        "config": {
            "table": "products",
            "fields": [
                {"name": "name", "type": "string", "required": True},
                {"name": "price", "type": "float", "required": True}
            ]
        }
    }
]

try:
    print("Generating project files...")
    files = GeneratorService.get_project_files(project_info, features)
    print("Successfully generated files:")
    for path in files.keys():
        print(f" - {path}")
except Exception as e:
    import traceback
    traceback.print_exc()
