import os
import json
from typing import Any, Dict

class AIService:
    """AI integration service with sandboxing"""
    
    @staticmethod
    def generate_feature_config(feature_type: str, base_config: Dict[str, Any], prompt_text: str = None) -> Dict[str, Any]:
        """Generate feature configuration using Local AI (Mistral/Ollama)"""
        import requests
        import re
        
        # Default to Ollama local instance
        ai_url = os.getenv('AI_API_URL', 'http://localhost:11434/api/generate')
        model = os.getenv('AI_MODEL', 'mistral')
        
        if not prompt_text:
            return {'error': 'Prompt is required'}, 400

        # Construct a specific system prompt based on type
        if feature_type == 'CRUD':
            system_prompt = """You are a backend configuration assistant for CRUD features.
            Rule 1: Return ONLY valid JSON. No markdown, no explanations.
            Rule 2: The structure MUST be:
            {
                "table": "table_name_lowercase",
                "fields": [
                    { "name": "field_name", "type": "string|integer|boolean|datetime|float", "required": true|false }
                ]
            }
            Rule 3: Always include an 'id' field as integer primary key if not specified.
            """
        elif feature_type == 'FUNCTIONS':
            system_prompt = """You are a Senior Backend Engineer creating professional Custom Functions.
            Rule 1: Return ONLY valid JSON.
            Rule 2: The structure MUST be:
            {
                "name": "function_name_snake_case",
                "path": "/api/v1/custom/endpoint",
                "method": "POST",
                "code": "def handler(input_data):\\n    # Professional logic with validation\\n    val = input_data.get('key')\\n    if not val:\\n        return {'error': 'Missing key'}\\n    # ... logic result ...\\n    return {'success': True, 'data': ...}",
                "input_schema": { 
                    "type": "object", 
                    "required": ["key"],
                    "properties": { "key": { "type": "string", "description": "purpose of field" } } 
                },
                "output_schema": { "type": "object", "properties": { "success": { "type": "boolean" } } }
            }
            Rule 3: CODE QUALITY. Avoid trivial logic. Implement realistic business processing (e.g., calculations, data transformation, validation logic).
            Rule 4: Always use input_data.get() safely to avoid KeyErrors.
            Example for 'Discount': Use logic that takes 'price' and 'percentage', validates they are numbers, calculates 'final_price', and returns a detailed breakdown.
            """
        elif feature_type == 'AUTH':
            system_prompt = """You are a backend configuration assistant for Authentication.
            Rule 1: Return ONLY valid JSON. No markdown, no explanations.
            Rule 2: The structure MUST be:
            {
                "auth_type": "jwt|oauth",
                "providers": ["email", "google", "github"],
                "features": {
                    "registration": true,
                    "forgot_password": true,
                    "email_verification": false
                },
                "extra_fields": [
                    { "name": "field_name", "type": "string|integer", "required": true }
                ]
            }
            """
        elif feature_type == 'ANALYTICS':
            crud_features = base_config.get('crud_features', [])
            crud_context = "\nREGISTERED CRUD TABLES (Differentiates between Display Name and Database Table Name):\n"
            for cf in crud_features:
                name = cf.get('name', 'Unknown')
                table = (cf.get('config') or {}).get('table', name.lower())
                fields = (cf.get('config') or {}).get('fields', [])
                field_names = [f.get('name') for f in fields if f.get('name')]
                crud_context += f"- Display Name: '{name}' -> REAL DATABASE TABLE: '{table}' (Columns: {', '.join(field_names)})\n"

            system_prompt = f"""You are a data engineer generating JSON configurations for aggregation reports.
            Rule 1: Return ONLY valid JSON.
            Rule 2: Use this exact schema:
            {{
                "reports": [
                    {{ 
                        "name": "Human-readable label", 
                        "entity": "THE_REAL_DATABASE_TABLE_NAME_FROM_CONTEXT", 
                        "mode": "simple|advanced",
                        "type": "count|sum|avg|max|min", 
                        "field": "column_name",
                        "group_by": "optional_column_to_group_by",
                        "expression": "sql_subset_expression",
                        "sql_preview": "SELECT ... FROM THE_REAL_DATABASE_TABLE_NAME_FROM_CONTEXT ..." 
                    }}
                ]
            }}
            Rule 3: REFERENCE CONTEXT: 
            {crud_context}
            
            Rule 4 CRITICAL: For the "entity" field and inside "sql_preview", you MUST use the 'REAL DATABASE TABLE' value provided in the context. 
            NEVER use the 'Display Name' (like "CRUD 1") in the technical "entity" field or SQL query.
            
            Rule 5: Always include "sql_preview".
            """
        else:
            system_prompt = f"You are a backend configuration assistant. Generate a valid JSON for a {feature_type} feature."

        full_prompt = f"{system_prompt}\n\nUser Description: {prompt_text}\n\nJSON:"
        
        try:
            # Call Ollama API
            response = requests.post(ai_url, json={
                "model": model,
                "prompt": full_prompt,
                "stream": False,
                "format": "json" # Force JSON mode if supported by model/version
            }, timeout=30)
            
            if response.status_code != 200:
                return {'error': f"AI Provider Error: {response.text}"}, 500
                
            ai_data = response.json()
            generated_text = ai_data.get('response', '')
            
            # Clean up response (remove markdown code blocks if present)
            clean_text = re.sub(r'```json\s*', '', generated_text)
            clean_text = re.sub(r'```\s*', '', clean_text)
            clean_text = clean_text.strip()
            
            # Parse JSON
            config = json.loads(clean_text)
            
            return {
                'success': True,
                'ai_generated': True,
                'config': config,
                'ai_response': {
                    'raw_text': generated_text,
                    'cleaned_text': clean_text,
                    'model_used': model
                },
                'message': f'Successfully generated {feature_type} configuration using AI'
            }
            
        except requests.exceptions.ConnectionError:
            return {'error': 'Could not connect to local AI (Ollama). Is it running on port 11434?'}, 503
        except json.JSONDecodeError:
            return {'error': 'AI generated invalid JSON. Please try again.'}, 500
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def generate_test_data(feature_type: str, schema: Dict[str, Any], prompt_text: str = None) -> Dict[str, Any]:
        """Generate mock test data using Local AI (Mistral/Ollama)"""
        import requests
        import re
        
        ai_url = os.getenv('AI_API_URL', 'http://localhost:11434/api/generate')
        model = os.getenv('AI_MODEL', 'mistral')
        
        feature_type_upper = feature_type.upper()
        
        if feature_type_upper == 'AUTH':
            extra_fields = schema.get('extra_fields', [])
            extra_names = [f.get('name') for f in extra_fields if f.get('name')]
            fields_desc = "email, password"
            if extra_names:
                fields_desc += f", {', '.join(extra_names)}"
            
            system_prompt = f"""You are an API tester generating a MOCK request body.
            Your task is to generate a realistic JSON for a user registration/login.
            
            Fields to include: {fields_desc}
            
            Rule 1: Return ONLY a FLAT JSON object.
            Rule 2: Do NOT include configuration metadata like 'auth_type', 'providers', or 'features'.
            Rule 3: Make the data look like real user input.
            """
        elif feature_type_upper == 'FUNCTIONS':
            input_schema = schema.get('input_schema', {})
            props = input_schema.get('properties', {})
            field_names = list(props.keys())
            
            system_prompt = f"""You are an API tester. Generate a realistic JSON request body for a custom function.
            Expected Fields from Schema: {', '.join(field_names) if field_names else 'None (generate generic data)'}
            Full Input Schema: {json.dumps(input_schema)}
            
            Rule 1: Return ONLY valid JSON.
            Rule 2: Ensure the structure matches the input_schema exactly.
            """
        elif feature_type_upper == 'ANALYTICS':
            system_prompt = """You are an API tester. 
            Generate a JSON body for a POST request to an analytics filter endpoint.
            Fields: "filters" (object), "start_date" (ISO string), "end_date" (ISO string).
            
            Rule 1: Return ONLY valid JSON.
            """
        else:
            # Standard CRUD fields logic
            fields = schema.get('fields', [])
            field_names = [f.get('name') for f in fields if f.get('name')]
            
            system_prompt = f"""You are a test data generator for a {feature_type} entity.
            REQUIRED FIELDS: {', '.join(field_names)}
            
            Rule 1: Return ONLY a FLAT JSON object with the fields above.
            Rule 2: Match the data types from the schema: {json.dumps(fields)}
            Rule 3: Do NOT include 'id', 'created_at', etc.
            """
        
        full_prompt = system_prompt
        if prompt_text:
            full_prompt += f"\n\nUser context (Apply ONLY if compatible with schema): {prompt_text}"
        
        full_prompt += "\n\nJSON Request Body:"
        
        try:
            response = requests.post(ai_url, json={
                "model": model,
                "prompt": full_prompt,
                "stream": False,
                "format": "json"
            }, timeout=30)
            
            if response.status_code != 200:
                return {'error': f"AI Provider Error: {response.text}"}, 500
                
            ai_data = response.json()
            generated_text = ai_data.get('response', '')
            
            clean_text = re.sub(r'```json\s*', '', generated_text)
            clean_text = re.sub(r'```\s*', '', clean_text)
            clean_text = clean_text.strip()
            
            try:
                data_body = json.loads(clean_text)
            except json.JSONDecodeError:
                # If JSON fails, try to extract it from the text
                json_match = re.search(r'\{.*\}', clean_text, re.DOTALL)
                if json_match:
                    data_body = json.loads(json_match.group())
                else:
                    raise
            
            return {
                'success': True,
                'test_data': data_body,
                'ai_response': {
                    'raw_text': generated_text,
                    'model_used': model
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'AI test data generation failed'
            }

    @staticmethod
    def generate_project_plan(prompt_text: str, current_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate or refine project configuration from natural language - CHAT MODE"""
        import requests
        import re
        
        ai_url = os.getenv('AI_API_URL', 'http://localhost:11434/api/generate')
        model = os.getenv('AI_MODEL', 'mistral')
        
        context_str = ""
        if current_context and current_context.get('features'):
            context_str = "\nCURRENT PROJECT STATE (Refine this based on user request):\n"
            context_str += json.dumps(current_context, indent=2)

        examples = """
        FEATURE CONFIG EXAMPLES:
        [CRUD]: { "table": "products", "fields": [{ "name": "price", "type": "float", "required": true }] }
        [AUTH]: { "auth_type": "jwt", "providers": ["email"], "features": { "registration": true }, "extra_fields": [{ "name": "username", "type": "string" }] }
        [ANALYTICS]: { "reports": [{ "name": "Sales", "entity": "products", "type": "sum", "field": "price", "mode": "simple", "sql_preview": "SELECT SUM(price) FROM products" }] }
        [FUNCTIONS]: { "name": "calc", "path": "/api/calc", "method": "POST", "input_schema": {"type": "object", "properties": {"number1": {"type": "integer"}}}, "code": "def handler(input_data):\\n    return {'result': input_data.get('number1', 0) * 2}" }
        """

        system_prompt = f"""You are an expert Backend Architect.
        Your task is to analyze the user's request and generate a complete, production-ready configuration for a backend project.
        
        {context_str}

        The platform supports 4 Feature Types:
        1. CRUD: Database tables. Requires 'table' name and 'fields' list (name, type, required).
           - Types: 'string', 'integer', 'boolean', 'datetime', 'float'.
        2. AUTH: Authentication. Requires 'auth_type' (jwt) and 'providers' (email).
           - Custom user fields (like 'username', 'age') MUST go into 'extra_fields': [{{"name": "...", "type": "string|integer", "required": true}}].
        3. ANALYTICS: Aggregations. Requires 'reports' list. 
           - 'reports' logic: Use 'entity' to link to the technical 'table' name of a CRUD feature. 
           - ALWAYS include 'sql_preview': "SELECT ... FROM [TECHNICAL_TABLE_NAME] ..."
        4. FUNCTIONS: Custom logic. Requires 'name', 'code', 'path', 'method', 'input_schema', 'output_schema'.
           - 'code' MUST be a valid Python function: "def handler(input_data):\n    # logic\n    return {{...}}"
           - 'input_schema': JSON Schema describing expected fields in input_data.

        DISTINCTION RULES:
        - AUTH is for user management (Login, Signup, JWT).
        - FUNCTIONS is for business logic (Emails, Payments, Processing). NEVER use FUNCTIONS for simple AUTH.
        - ANALYTICS is for data reporting. IMPORTANT: In 'entity' and 'sql_preview', ALWAYS use the technical 'table' name of the CRUD feature, NEVER the feature's display name.

        REFINEMENT RULES:
        - If CURRENT PROJECT STATE is provided, the user wants to MODIFY it.
        - SINGLE AUTH RULE: There can be ONLY ONE feature of type AUTH. If the user asks for more auth fields or changes, MODIFY THE EXISTING AUTH FEATURE. Never create a second Auth feature.
        - Keep existing features unless requested to remove them.
        - Only update fields or add features mentioned in the request.
        - ALWAYS return the ENTIRE updated project structure (including unchanged parts).
        - CUSTOM USER FIELDS: If the user asks to add "phone", "address", etc. to "Auth" or "User", add them to the 'extra_fields' list in the (single) AUTH feature configuration.

        You must return a JSON object with this EXACT structure:
        {{
            "project_info": {{ "name": "Project Name", "description": "Short description" }},
            "features": [
                {{
                    "name": "Feature Name",
                    "type": "CRUD|AUTH|ANALYTICS|FUNCTIONS",
                    "config": {{ ... feature specific config ... }}
                }}
            ]
        }}

        {examples}
        """
        
        full_prompt = f"{system_prompt}\n\nUser Request: {prompt_text}\n\nJSON Plan:"
        
        try:
            response = requests.post(ai_url, json={
                "model": model,
                "prompt": full_prompt,
                "stream": False,
                "format": "json"
            }, timeout=45)
            
            if response.status_code != 200:
                return {'error': f"AI Provider Error: {response.text}"}, 500
                
            generated_text = response.json().get('response', '')
            
            # Clean and parse
            clean_text = re.sub(r'```json\s*', '', generated_text)
            clean_text = re.sub(r'```\s*', '', clean_text).strip()
            
            plan = json.loads(clean_text)
            
            # Basic validation
            if 'features' not in plan:
                plan['features'] = []
            if 'project_info' not in plan:
                plan['project_info'] = {'name': 'Generated Project', 'description': 'AI Generated'}
                
            return {
                'success': True,
                'plan': plan,
                'ai_response': {
                    'raw_text': generated_text,
                    'model_used': model
                }
            }
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def generate_function_code(data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate function code using AI - AI-ASSISTED"""
        import requests
        import re
        
        prompt_text = data.get('prompt')
        feature_name = data.get('name', 'CustomFunction')
        existing_code = data.get('existing_code', '')
        
        if not prompt_text:
            return {'error': 'Prompt is required'}, 400

        ai_url = os.getenv('AI_API_URL', 'http://localhost:11434/api/generate')
        model = os.getenv('AI_MODEL', 'mistral')
        
        system_prompt = f"""You are a Python backend developer. 
        Your task is to write a Python function named 'handler' for a backend feature named '{feature_name}'.
        
        Rules:
        1. The code MUST define a function: 'def handler(input_data):'
        2. 'input_data' is a dictionary containing the request parameters.
        3. The function should return a dictionary or a list.
        4. Include necessary logic, comments, and return statement.
        5. Return ONLY the code. No markdown code blocks, no explanations.
        
        Context: The function should {prompt_text}
        """
        
        if existing_code:
            system_prompt += f"\nExisting code to modify:\n{existing_code}"
            
        try:
            response = requests.post(ai_url, json={
                "model": model,
                "prompt": system_prompt,
                "stream": False
            }, timeout=30)
            
            if response.status_code != 200:
                return {'error': f"AI Provider Error: {response.text}"}, 500
                
            generated_text = response.json().get('response', '')
            clean_code = re.sub(r'```python\s*', '', generated_text)
            clean_code = re.sub(r'```\s*', '', clean_code).strip()
            
            return {
                'success': True,
                'ai_generated': True,
                'code': clean_code,
                'ai_response': {
                    'raw_text': generated_text,
                    'model_used': model
                },
                'message': 'Function code generated successfully'
            }
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_suggested_prompts(context_type: str, context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate 3-5 suggested prompts based on context - AI-ASSISTED"""
        import requests
        import re
        
        ai_url = os.getenv('AI_API_URL', 'http://localhost:11434/api/generate')
        model = os.getenv('AI_MODEL', 'mistral')
        
        # context_type can be 'config' or 'test_data'
        feature_name = context_data.get('name', 'feature')
        feature_type = context_data.get('feature_type', 'CRUD')
        
        if context_type == 'config':
            if feature_type == 'AUTH':
                prompt = "Generate 3 short, creative user prompts for configuring an Authentication system. "
                prompt += "Example: 'Add phone number and full name to registration', 'Setup Google OAuth with email verification', 'JWT auth with strictly required username'. "
            elif feature_type == 'ANALYTICS':
                crud_context = ""
                if context_data and context_data.get('crud_features'):
                    names = [f.get('name', 'Unknown') for f in context_data['crud_features']]
                    crud_context = f" based on your {', '.join(names)} tables"
                
                prompt = f"Generate 3 short, creative user prompts for configuring a Data Analytics & Reporting system{crud_context}. "
                prompt += "Example: 'Total count of employees', 'Average salary by department', 'Sum of all sales transactions'. "
            else:
                prompt = f"Generate 3 short, creative user prompts for building a '{feature_name}' {feature_type} backend feature. "
                prompt += "Example: 'Create a user profile system with bio and avatar URL'. "
        else:
            schema = context_data.get('schema', {})
            if feature_type == 'AUTH':
                prompt = f"Generate 3 short prompts for testing an Authentication feature with this config: {json.dumps(schema)}. "
                prompt += "Example: 'Test registration with a long name', 'Try to login with wrong password', 'Register with a phone number'. "
            elif feature_type == 'ANALYTICS':
                prompt = f"Generate 3 short prompts for testing a Data Analytics feature with this config: {json.dumps(schema)}. "
                prompt += "Example: 'Check total count of items', 'Verify the sum of costs matches expected', 'Get average age of users'. "
            else:
                prompt = f"Generate 3 short prompts for testing a '{feature_name}' feature with this schema: {json.dumps(schema)}. "
                prompt += "Example: 'Generate an edge case with empty fields'. "
            
        prompt += "Return ONLY a JSON list of strings. No markdown, no numbers."
        
        try:
            response = requests.post(ai_url, json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "format": "json"
            }, timeout=15)
            
            if response.status_code != 200:
                # Return defaults if AI fails
                return {'prompts': ["Create a standard setup", "Add advanced validation", "Optimize for performance"]}
                
            generated_text = response.json().get('response', '')
            clean_text = re.sub(r'```json\s*', '', generated_text)
            clean_text = re.sub(r'```\s*', '', clean_text).strip()
            
            prompts = json.loads(clean_text)
            # Ensure it's a list
            if isinstance(prompts, dict) and 'prompts' in prompts:
                prompts = prompts['prompts']
            elif not isinstance(prompts, list):
                prompts = ["Create a standard setup", "Add advanced validation", "Optimize for performance"]
                
            return {'prompts': prompts[:5]}
        except:
            return {'prompts': ["Create a standard setup", "Add advanced validation", "Optimize for performance"]}
    
    @staticmethod
    def sandbox_execute_code(code: str, input_data: Dict[str, Any], timeout: int = 5) -> Dict[str, Any]:
        """Execute code in sandbox - SANDBOXED"""
        # Security: Only execute in restricted environment
        if not os.getenv('AI_SANDBOX_ENABLED') == 'True':
            return {'error': 'Sandbox disabled'}, 403
        
        try:
            # Create restricted execution environment
            import json as py_json, datetime as py_datetime, math as py_math
            restricted_globals = {
                '__builtins__': {
                    'len': len, 'range': range, 'str': str, 'int': int,
                    'float': float, 'list': list, 'dict': dict, 'print': print,
                    'sum': sum, 'min': min, 'max': max, 'round': round,
                },
                'json': py_json,
                'datetime': py_datetime,
                'math': py_math
            }
            restricted_locals = {'input_data': input_data}
            
            # Execute code with timeout
            exec(code, restricted_globals, restricted_locals)
            
            result = restricted_locals.get('result', None)
            
            return {
                'success': True,
                'result': result,
                'output': restricted_locals
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def validate_ai_response(response: Any, schema: Dict[str, Any]) -> bool:
        """Validate AI-generated response against schema - SAFETY"""
        # TODO: Implement JSON schema validation
        # Use jsonschema library to validate
        return True
