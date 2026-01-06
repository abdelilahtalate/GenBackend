
import requests
import json

def test_preview():
    url = "http://localhost:5000/api/projects/preview"
    # Note: We need a valid login or we bypass it for testing if the route is open
    # The current route /api/projects/preview in projects.py does NOT have @token_required
    
    payload = {
        "projectInfo": {"name": "Test Project", "description": "Testing preview"},
        "features": [
            {
                "name": "Products",
                "feature_type": "CRUD",
                "configuration": {
                    "table": "products",
                    "fields": [
                        {"name": "name", "type": "string", "required": True},
                        {"name": "price", "type": "float", "required": True}
                    ]
                }
            }
        ]
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Successfully fetched project files!")
            print("Files found:", list(data['files'].keys()))
            if 'app/models/crud.py' in data['files']:
                print("\nContent of app/models/crud.py:")
                print("-" * 20)
                print(data['files']['app/models/crud.py'][:200] + "...")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_preview()
