from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.utils.decorators import token_required, handle_exceptions
from app.services.ai_service import AIService

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/generate-config', methods=['POST', 'OPTIONS'])
@token_required
@handle_exceptions
def generate_config():
    """Generate feature config using AI - AI-ASSISTED"""
    data = request.get_json()
    
    result = AIService.generate_feature_config(
        data.get('feature_type'),
        data.get('base_config', {}),
        data.get('prompt')
    )
    
    return result

@ai_bp.route('/generate-plan', methods=['POST'])
@token_required
@handle_exceptions
def generate_plan():
    """Generate or refine project plan using AI - AI-ASSISTED"""
    data = request.get_json()
    
    result = AIService.generate_project_plan(
        data.get('prompt'),
        data.get('current_context')
    )
    
    return result

@ai_bp.route('/generate-test-data', methods=['POST'])
@token_required
@handle_exceptions
def generate_test_data():
    """Generate test data using AI - AI-ASSISTED"""
    data = request.get_json()
    
    result = AIService.generate_test_data(
        data.get('feature_type'),
        data.get('schema', {}),
        data.get('prompt')
    )
    
    return result

@ai_bp.route('/generate-code', methods=['POST'])
@token_required
@handle_exceptions
def generate_code():
    """Generate function code using AI - AI-ASSISTED"""
    data = request.get_json()
    
    result = AIService.generate_function_code(data)
    return result

@ai_bp.route('/sandbox-execute', methods=['POST'])
@token_required
@handle_exceptions
def sandbox_execute():
    """Execute code in sandbox - SANDBOXED"""
    data = request.get_json()
    
    result = AIService.sandbox_execute_code(
        data.get('code'),
        data.get('input_data', {}),
        data.get('timeout', 5)
    )
    
    return result

@ai_bp.route('/suggested-prompts', methods=['POST'])
@token_required
@handle_exceptions
def get_suggested_prompts():
    """Get suggested prompts using AI - AI-ASSISTED"""
    data = request.get_json()
    
    result = AIService.get_suggested_prompts(
        data.get('context_type', 'config'),
        data.get('context_data', {})
    )
    
    return result
