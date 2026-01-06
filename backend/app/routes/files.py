from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import get_jwt_identity
from app.utils.decorators import token_required, handle_exceptions
from app.services.file_service import FileService

files_bp = Blueprint('files', __name__, url_prefix='/api/files')

@files_bp.route('/upload', methods=['POST'])
@token_required
@handle_exceptions
def upload_file():
    """Upload file - MANUAL"""
    user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    project_id = request.form.get('project_id', type=int)
    
    result, status = FileService.upload_file(file, user_id, project_id)
    return jsonify(result), status

@files_bp.route('/<int:file_id>', methods=['GET'])
@token_required
@handle_exceptions
def get_file(file_id):
    """Get file metadata - MANUAL"""
    user_id = get_jwt_identity()
    result, status = FileService.get_file(file_id, user_id)
    return jsonify(result), status

@files_bp.route('/<int:file_id>', methods=['DELETE'])
@token_required
@handle_exceptions
def delete_file(file_id):
    """Delete file - MANUAL"""
    user_id = get_jwt_identity()
    result, status = FileService.delete_file(file_id, user_id)
    return jsonify(result), status
