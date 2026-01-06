from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.utils.decorators import token_required, handle_exceptions
from app.utils.validators import ProjectCreateSchema
from app.services.project_service import ProjectService

projects_bp = Blueprint('projects', __name__, url_prefix='/api/projects')

@projects_bp.route('', methods=['POST'])
@token_required
@handle_exceptions
def create_project():
    """Create new project - MANUAL"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        schema = ProjectCreateSchema(**data)
        result, status = ProjectService.create_project(
            user_id,
            schema.name,
            schema.description,
            schema.generation_mode
        )
        return jsonify(result), status
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@projects_bp.route('', methods=['GET'])
@token_required
@handle_exceptions
def list_projects():
    """List user projects - MANUAL"""
    user_id = get_jwt_identity()
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    result, status = ProjectService.get_user_projects(user_id, limit, offset)
    return jsonify(result), status

@projects_bp.route('/stats', methods=['GET'])
@token_required
@handle_exceptions
def get_project_stats():
    """Get project statistics - MANUAL"""
    user_id = get_jwt_identity()
    result, status = ProjectService.get_user_stats(user_id)
    return jsonify(result), status

@projects_bp.route('/<int:project_id>', methods=['GET'])
@token_required
@handle_exceptions
def get_project(project_id):
    """Get project details - MANUAL"""
    user_id = get_jwt_identity()
    result, status = ProjectService.get_project(project_id, user_id)
    return jsonify(result), status

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@token_required
@handle_exceptions
def update_project(project_id):
    """Update project - MANUAL"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    result, status = ProjectService.update_project(
        project_id,
        user_id,
        data.get('name'),
        data.get('description'),
        data.get('status')
    )
    return jsonify(result), status

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@token_required
@handle_exceptions
def delete_project(project_id):
    """Delete project - MANUAL"""
    user_id = get_jwt_identity()
    result, status = ProjectService.delete_project(project_id, user_id)
    return jsonify(result), status

@projects_bp.route('/<int:project_id>/regenerate-key', methods=['POST'])
@token_required
@handle_exceptions
def regenerate_project_key(project_id):
    """Regenerate project API key - MANUAL"""
    user_id = get_jwt_identity()
    result, status = ProjectService.regenerate_api_key(project_id, user_id)
    return jsonify(result), status

def _format_features_for_generator(features):
    """Helper to unify feature structure for GeneratorService"""
    formatted = []
    for f in features:
        if isinstance(f, dict):
            cfg = f.get('config') or f.get('configuration') or {}
            formatted.append({
                'name': f.get('name'),
                'type': f.get('type') or f.get('feature_type'),
                'config': cfg,
                'configuration': cfg
            })
        else:
            # Assuming it's a model-like object with attributes
            cfg = getattr(f, 'configuration', {}) or getattr(f, 'config', {})
            formatted.append({
                'name': getattr(f, 'name', 'Unknown'),
                'type': getattr(f, 'feature_type', 'CRUD'),
                'config': cfg,
                'configuration': cfg
            })
    return formatted

@projects_bp.route('/download', methods=['POST'])
def download_project_code():
    """Generate and download project code"""
    import traceback
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        project_info = data.get('projectInfo', {})
        features = data.get('features', [])
        
        from app.services.generator_service import GeneratorService
        from flask import send_file
        
        # Format features correctly
        formatted_features = _format_features_for_generator(features)
        
        # Generate the zip file in memory
        memory_file = GeneratorService.generate_project(project_info, formatted_features)
        
        filename = f"{project_info.get('name', 'project').lower().replace(' ', '_')}.zip"
        
        return send_file(
            memory_file,
            mimetype='application/zip',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        print(f"Generation error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

@projects_bp.route('/preview', methods=['POST'])
def preview_project_code():
    """Generate and return project code as JSON for preview"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        project_info = data.get('projectInfo', {})
        features = data.get('features') or data.get('selectedFeatures', [])
        
        from app.services.generator_service import GeneratorService
        
        # Format features correctly
        formatted_features = _format_features_for_generator(features)

        files = GeneratorService.get_project_files(project_info, formatted_features)
        
        return jsonify({
            'success': True,
            'files': files
        })
    except Exception as e:
        import traceback
        print(f"Preview error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500
@projects_bp.route('/<int:project_id>/sync-from-files', methods=['POST'])
@token_required
@handle_exceptions
def sync_project_from_files(project_id):
    """Sync manual code edits back to feature configurations"""
    user_id = get_jwt_identity()
    data = request.get_json()
    files = data.get('files', {})
    
    result, status = ProjectService.sync_from_files(project_id, user_id, files)
    return jsonify(result), status
