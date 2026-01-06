from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.utils.decorators import token_required, handle_exceptions
from app.models import CustomFunction
from app import db

functions_bp = Blueprint('functions', __name__, url_prefix='/api/functions')

@functions_bp.route('', methods=['POST'])
@token_required
@handle_exceptions
def create_function():
    """Create custom function - MANUAL, AI, or MIXED"""
    data = request.get_json()
    
    try:
        function = CustomFunction(
            project_id=data.get('project_id'),
            name=data.get('name'),
            description=data.get('description'),
            function_code=data.get('function_code'),
            input_schema=data.get('input_schema'),
            output_schema=data.get('output_schema'),
            generation_mode=data.get('generation_mode', 'manual'),
            endpoint_path=data.get('endpoint_path'),
            http_method=data.get('http_method', 'POST')
        )
        
        db.session.add(function)
        db.session.commit()
        
        return jsonify({'function': function.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@functions_bp.route('/project/<int:project_id>', methods=['GET'])
@token_required
@handle_exceptions
def get_project_functions(project_id):
    """Get project functions - MANUAL"""
    functions = CustomFunction.query.filter_by(project_id=project_id).all()
    return jsonify({'functions': [f.to_dict() for f in functions]}), 200

@functions_bp.route('/<int:function_id>/test', methods=['POST'])
@token_required
@handle_exceptions
def test_function(function_id):
    """Test function execution - MANUAL"""
    function = CustomFunction.query.get(function_id)
    
    if not function:
        return jsonify({'error': 'Function not found'}), 404
    
    data = request.get_json()
    input_data = data.get('input_data', {})
    
    # Execute function
    try:
        result = eval(function.function_code)(input_data)
        return jsonify({'success': True, 'result': result}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
