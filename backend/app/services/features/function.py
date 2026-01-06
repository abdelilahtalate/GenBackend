from .base import FeatureHandler
import os

class FunctionHandler(FeatureHandler):
    """Handler for testing custom Python functions"""
    
    def handle(self, method, endpoint, body, schema, context=None):
        """
        Execute the function code with the provided input body.
        
        Args:
            method (str): HTTP method (POST is preferred for execution)
            endpoint (str): The target endpoint path
            body (dict): Input data for the function
            schema (dict): Should contain 'code' or 'function_code'
        """
        # For non-GET methods, we expect the code to be executed
        # If method is GET, maybe we just return metadata?
        
        code = schema.get('code') or schema.get('function_code')
        
        if not code:
            return {
                'status': 400,
                'error': 'No code provided',
                'message': 'The function feature must have executable Python code'
            }, 400
            
        try:
            # We use a restricted execution environment
            # Safety: This is a dev-tool, but we still try to be safe
            restricted_globals = {
                '__builtins__': {
                    'len': len, 'range': range, 'str': str, 'int': int,
                    'float': float, 'list': list, 'dict': dict, 'print': print
                }
            }
            # The code should now preferably define a function named 'handler'
            restricted_locals = {'input_data': body or {}}
            
            # Execute the code
            exec(code, restricted_globals, restricted_locals)
            
            # 1. Try to find 'handler' function
            handler = restricted_locals.get('handler')
            if callable(handler):
                try:
                    result = handler(body or {})
                except KeyError as kerr:
                    return {
                        'success': False,
                        'error': str(kerr),
                        'message': f"Missing required input field: {str(kerr)}. Check your input body or function logic."
                    }, 400
                except Exception as exec_err:
                    return {
                        'success': False,
                        'error': str(exec_err),
                        'message': 'Error during function execution'
                    }, 400
            else:
                # 2. Fallback to 'result' variable for legacy snippets
                result = restricted_locals.get('result')
                
                # Help the user: if 'result' isn't set, return all locals (except input_data)
                if result is None:
                    result = {k: v for k, v in restricted_locals.items() if k not in ['input_data', 'handler', '__builtins__']}
            
            return {
                'success': True,
                'result': result
            }, 200
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Execution error'
            }, 400
