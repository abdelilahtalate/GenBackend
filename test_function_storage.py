"""
Test script to verify function storage with field mapping
"""
import requests
import json

BASE_URL = "http://localhost:5000"

# You'll need to replace these with actual values
TOKEN = "your_jwt_token_here"  # Get from login
PROJECT_ID = 1  # Your project ID

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Test 1: Create a FUNCTIONS feature with AI-generated config
print("=" * 60)
print("Test 1: Creating FUNCTIONS feature")
print("=" * 60)

function_data = {
    "project_id": PROJECT_ID,
    "name": "Sum Calculator",
    "feature_type": "FUNCTIONS",
    "generation_mode": "ai",
    "configuration": {
        "name": "sum_calculator",
        "path": "/api/v1/custom/sum",  # Frontend field name
        "method": "POST",  # Frontend field name
        "code": """def handler(input_data):
    num1 = input_data.get('number1', 0)
    num2 = input_data.get('number2', 0)
    result = num1 + num2
    return {'sum': result}""",  # Frontend field name
        "input_schema": {
            "type": "object",
            "required": ["number1", "number2"],
            "properties": {
                "number1": {"type": "number"},
                "number2": {"type": "number"}
            }
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "sum": {"type": "number"}
            }
        }
    },
    "schema_definition": {}
}

try:
    response = requests.post(
        f"{BASE_URL}/api/features",
        headers=headers,
        json=function_data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print("\n✅ SUCCESS! Function feature created")
        feature_id = response.json().get('feature', {}).get('id')
        
        # Test 2: Retrieve the feature to verify field mapping
        print("\n" + "=" * 60)
        print("Test 2: Retrieving feature to verify field mapping")
        print("=" * 60)
        
        get_response = requests.get(
            f"{BASE_URL}/api/features/project/{PROJECT_ID}",
            headers=headers
        )
        
        print(f"Status Code: {get_response.status_code}")
        features = get_response.json().get('features', [])
        
        # Find our function
        our_function = next((f for f in features if f.get('id') == feature_id), None)
        
        if our_function:
            config = our_function.get('configuration', {})
            print(f"\nRetrieved Configuration:")
            print(json.dumps(config, indent=2))
            
            # Verify frontend field names are present
            has_code = 'code' in config
            has_path = 'path' in config
            has_method = 'method' in config
            
            print(f"\n✓ Has 'code' field: {has_code}")
            print(f"✓ Has 'path' field: {has_path}")
            print(f"✓ Has 'method' field: {has_method}")
            
            if has_code and has_path and has_method:
                print("\n✅ Field mapping working correctly!")
            else:
                print("\n❌ Field mapping issue - frontend fields missing")
    else:
        print(f"\n❌ FAILED: {response.json()}")
        
except Exception as e:
    print(f"\n❌ Error: {str(e)}")

print("\n" + "=" * 60)
print("Note: Update TOKEN and PROJECT_ID variables before running")
print("=" * 60)
