from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.utils.decorators import token_required, handle_exceptions, apikey_required
from app.utils.validators import FeatureCreateSchema
from app.services.feature_service import FeatureService

features_bp = Blueprint('features', __name__, url_prefix='/api/features')

@features_bp.route('', methods=['POST'])
@token_required
@handle_exceptions
def create_feature():
    """Create feature - MANUAL, AI, or MIXED"""
    data = request.get_json()
    
    try:
        schema = FeatureCreateSchema(**data)
        result, status = FeatureService.create_feature(
            data.get('project_id'),
            schema.name,
            schema.feature_type,
            schema.generation_mode,
            schema.configuration,
            schema.schema_definition
        )
        return jsonify(result), status
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@features_bp.route('/project/<int:project_id>', methods=['GET'])
@token_required
@handle_exceptions
def get_project_features(project_id):
    """Get project features - MANUAL"""
    result, status = FeatureService.get_project_features(project_id)
    return jsonify(result), status

@features_bp.route('/<int:feature_id>', methods=['PUT'])
@token_required
@handle_exceptions
def update_feature(feature_id):
    """Update feature - MANUAL"""
    data = request.get_json()
    result, status = FeatureService.update_feature(feature_id, **data)
    return jsonify(result), status

@features_bp.route('/<int:feature_id>', methods=['DELETE'])
@token_required
@handle_exceptions
def delete_feature(feature_id):
    """Delete feature - MANUAL"""
    result, status = FeatureService.delete_feature(feature_id)
    return jsonify(result), status

@features_bp.route('/test', methods=['POST'])
@token_required
@handle_exceptions
def test_feature_endpoint():
    """Test feature endpoint - MANUAL"""
    data = request.get_json()
    endpoint = data.get('endpoint', '')
    method = data.get('method', 'GET').upper()
    body = data.get('body')
    schema = data.get('schema')
    feature_type = data.get('feature_type', 'CRUD')
    feature_id_arg = data.get('feature_id')
    project_id = data.get('project_id')
    
    from app.models.feature import Feature
    from app.services.features import FeatureHandlerFactory
    
    # If schema is missing (transparent mode), try to find the feature
    if not schema and (feature_id_arg or (project_id and endpoint)):
        target_feature = None
        if feature_id_arg:
            target_feature = Feature.query.get(feature_id_arg)
        elif project_id:
            # Try to match by endpoint path (cleaning /api/ prefix if needed)
            features = Feature.query.filter_by(project_id=project_id).all()
            clean_path = endpoint.strip('/').lower()
            if clean_path.startswith('api/'):
                clean_path = clean_path[4:]
            
            for f in features:
                config = f.configuration or {}
                if f.feature_type.upper() == 'CRUD':
                    table_name = config.get('table', f.name.lower())
                    if clean_path.startswith(table_name):
                        target_feature = f
                        break
                elif f.feature_type.upper() in ['FUNCTIONS', 'FUNCTION']:
                    f_path = config.get('endpoint_path', f"/{f.name.lower().replace(' ', '_')}").strip('/').lower()
                    if clean_path == f_path:
                        target_feature = f
                        break
                elif f.feature_type.upper() == 'ANALYTICS':
                    if 'analytics' in clean_path:
                        target_feature = f
                        break
        
        if target_feature:
            schema = target_feature.configuration
            feature_type = target_feature.feature_type
            
    handler = FeatureHandlerFactory.get_handler(feature_type)
    context = {
        'user_id': get_jwt_identity(),
        'project_id': str(project_id) if project_id else None
    }
    response_data, status_code = handler.handle(method, endpoint, body, schema, context=context)
    
    return jsonify(response_data), status_code

@features_bp.route('/external/<path:subpath>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
@apikey_required
@handle_exceptions
def external_proxy_gateway(subpath, project_context=None):
    """Refined transparent proxy gateway using API Key"""
    method = request.method
    body = request.get_json(silent=True)
    
    from app.models.feature import Feature
    from app.services.features import FeatureHandlerFactory
    
    # Try to identify the target feature by subpath
    features = Feature.query.filter_by(project_id=project_context.id).all()
    target_feature = None
    target_endpoint_path = f"/{subpath}"
    
    # Simple matching logic: 
    # 1. Auth check
    if subpath.startswith('auth/'):
        target_feature = next((f for f in features if f.feature_type.upper() == 'AUTH'), None)
    
    # 2. CRUD check (matches /api/<table_name>)
    if not target_feature:
        for f in features:
            if f.feature_type.upper() == 'CRUD':
                config = f.configuration or {}
                table_name = config.get('table', f.name.lower())
                if subpath.startswith(table_name):
                    target_feature = f
                    # Adjust path to match what handler expects (usually /api/...)
                    target_endpoint_path = f"/api/{subpath}"
                    break
                    
    # 3. Functions check
    if not target_feature:
        for f in features:
            if f.feature_type.upper() in ['FUNCTIONS', 'FUNCTION']:
                config = f.configuration or {}
                f_path = config.get('endpoint_path', f"/{f.name.lower().replace(' ', '_')}")
                if f"/{subpath}" == f_path or subpath == f_path.lstrip('/'):
                    target_feature = f
                    break

    if not target_feature:
        return jsonify({'error': f'No feature found matching path: {subpath}'}), 404
        
    handler = FeatureHandlerFactory.get_handler(target_feature.feature_type)
    context = {
        'user_id': project_context.owner_id,
        'project_id': str(project_context.id)
    }
    
    # Use the feature's configuration as the schema
    schema = target_feature.configuration
    
    response_data, status_code = handler.handle(method, target_endpoint_path, body, schema, context=context)
    
    # Log the external request
    from app.models.api_request_log import ApiRequestLog
    try:
        log = ApiRequestLog(
            project_id=project_context.id,
            feature_id=target_feature.id,
            method=method,
            path=subpath,
            status_code=status_code
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Error logging external request: {str(e)}")
        
    return jsonify(response_data), status_code

@features_bp.route('/project/<int:project_id>/features/<int:feature_id>/endpoints', methods=['GET'])
@token_required
@handle_exceptions
def get_feature_endpoints(project_id, feature_id):
    """Get endpoint metadata for a specific feature"""
    result, status = FeatureService.get_feature_endpoints(project_id, feature_id)
    return jsonify(result), status
