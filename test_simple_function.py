"""
Quick test to verify the simplified AI function generation
"""
import requests
import json

# Test the AI service with the new simplified prompt
url = "http://localhost:5000/api/ai/generate"

payload = {
    "feature_type": "FUNCTIONS",
    "base_config": {},
    "prompt": "Create a function to sum two numbers"
}

print("Testing simplified AI function generation...")
print("=" * 60)

try:
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Successfully generated FUNCTIONS configuration using AI")
        print(f"\n🤖 Model: {data.get('ai_response', {}).get('model_used', 'unknown')}")
        print(f"\n📋 Generated Configuration:")
        print(json.dumps(data.get('config'), indent=2))
        
        # Show the code specifically
        code = data.get('config', {}).get('code', '')
        print(f"\n💻 Generated Code:")
        print(code)
        
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
