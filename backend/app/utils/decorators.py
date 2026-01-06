from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask import jsonify, current_app
from app.models import User

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # Allow OPTIONS requests to bypass auth (for CORS preflight)
        from flask import request
        if request.method == 'OPTIONS':
            return jsonify({'status': 'ok'}), 200
            
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            print(f"JWT Verification Failed: {str(e)}")  # Debug logging
            return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401
    return decorated

def role_required(roles):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user or user.role.name not in roles:
                return jsonify({'error': 'Forbidden', 'message': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def handle_exceptions(f):
    """Decorator for exception handling"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            current_app.logger.error(f"Error in {f.__name__}: {str(e)}")
            return jsonify({'error': 'Internal server error', 'message': str(e)}), 500
    return decorated

def apikey_required(f):
    """Decorator to require valid project API Key"""
    @wraps(f)
    def decorated(*args, **kwargs):
        from flask import request
        from app.models.project import Project
        
        # Allow OPTIONS
        if request.method == 'OPTIONS':
            return jsonify({'status': 'ok'}), 200
            
        api_key = request.headers.get('X-API-KEY')
        if not api_key:
            return jsonify({'error': 'Unauthorized', 'message': 'X-API-KEY header is missing'}), 401
            
        project = Project.query.filter_by(api_key=api_key).first()
        if not project:
            return jsonify({'error': 'Unauthorized', 'message': 'Invalid API Key'}), 401
            
        # Add project to kwargs if needed, or just let it pass
        kwargs['project_context'] = project
        return f(*args, **kwargs)
    return decorated
