from flask import Blueprint, request, jsonify
from app.utils.decorators import token_required, handle_exceptions
from app.utils.validators import UserRegisterSchema, UserLoginSchema
from app.services.auth_service import AuthService
from flask_jwt_extended import get_jwt_identity

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
@handle_exceptions
def register():
    """Register new user - MANUAL"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        data = request.get_json()
        schema = UserRegisterSchema(**data)
        
        result, status = AuthService.register_user(
            schema.email,
            schema.password,
            schema.first_name,
            schema.last_name
        )
        return jsonify(result), status
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
@handle_exceptions
def login():
    """Login user - MANUAL"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        data = request.get_json()
        schema = UserLoginSchema(**data)
        
        result, status = AuthService.login_user(schema.email, schema.password)
        return jsonify(result), status
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/profile', methods=['GET'])
@token_required
@handle_exceptions
def get_profile():
    """Get current user profile - MANUAL"""
    user_id = get_jwt_identity()
    result, status = AuthService.get_user_by_id(user_id)
    return jsonify(result), status

@auth_bp.route('/profile', methods=['PUT'])
@token_required
@handle_exceptions
def update_profile():
    """Update user profile - MANUAL"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    result, status = AuthService.update_user_profile(
        user_id,
        data.get('first_name'),
        data.get('last_name')
    )
    return jsonify(result), status

@auth_bp.route('/change-password', methods=['POST'])
@token_required
@handle_exceptions
def change_password():
    """Change password - MANUAL"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    result, status = AuthService.change_password(
        user_id,
        data.get('old_password'),
        data.get('new_password')
    )
    return jsonify(result), status
