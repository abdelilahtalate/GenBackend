import sys
import os
import json

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app.services.ai_service import AIService

def verify_ai():
    print("--- Testing Auth Config Suggestions ---")
    res = AIService.get_suggested_prompts('config', {'name': 'Auth', 'feature_type': 'AUTH'})
    print(f"Suggestions: {res}")
    
    print("\n--- Testing Auth Config Generation ---")
    prompt = "Add phone number and date of birth to registration. Password must be 8 chars."
    res = AIService.generate_feature_config('AUTH', {}, prompt)
    if 'config' in res:
        print(f"Generated Config: {json.dumps(res['config'], indent=2)}")
    else:
        print(f"Error: {res.get('error')}")

    print("\n--- Testing Auth Test Data Suggestions ---")
    schema = {
        "auth_type": "jwt",
        "extra_fields": [{"name": "phone", "type": "string", "required": True}]
    }
    res = AIService.get_suggested_prompts('test_data', {'name': 'Auth', 'feature_type': 'AUTH', 'schema': schema})
    print(f"Test Suggestions: {res}")

if __name__ == "__main__":
    verify_ai()
