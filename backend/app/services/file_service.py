import os
import secrets
from werkzeug.utils import secure_filename
from app import db
from app.models import FileUpload
from flask import current_app

class FileService:
    """File management service"""
    
    @staticmethod
    def upload_file(file, user_id: int, project_id: int = None) -> dict:
        """Upload file - MANUAL"""
        try:
            if not file:
                return {'error': 'No file provided'}, 400
            
            # Validate file
            if not FileService.is_file_allowed(file.filename):
                return {'error': 'File type not allowed'}, 400
            
            if file.content_length > current_app.config['MAX_FILE_SIZE']:
                return {'error': 'File too large'}, 400
            
            # Generate unique filename
            original_filename = secure_filename(file.filename)
            unique_filename = f"{secrets.token_hex(8)}_{original_filename}"
            
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            
            file_path = os.path.join(upload_folder, unique_filename)
            file.save(file_path)
            
            # Store metadata
            file_upload = FileUpload(
                uploader_id=user_id,
                project_id=project_id,
                filename=unique_filename,
                original_filename=original_filename,
                file_path=file_path,
                file_size=os.path.getsize(file_path),
                file_type=original_filename.split('.')[-1]
            )
            
            db.session.add(file_upload)
            db.session.commit()
            
            return {'file': file_upload.to_dict()}, 201
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def is_file_allowed(filename: str) -> bool:
        """Check if file type is allowed - MANUAL"""
        from flask import current_app
        if '.' not in filename:
            return False
        ext = filename.rsplit('.', 1)[1].lower()
        return ext in current_app.config['ALLOWED_EXTENSIONS']
    
    @staticmethod
    def get_file(file_id: int, user_id: int = None) -> dict:
        """Get file metadata - MANUAL"""
        file_upload = FileUpload.query.get(file_id)
        
        if not file_upload:
            return {'error': 'File not found'}, 404
        
        if user_id and file_upload.uploader_id != user_id:
            return {'error': 'Unauthorized'}, 403
        
        return {'file': file_upload.to_dict()}, 200
    
    @staticmethod
    def delete_file(file_id: int, user_id: int) -> dict:
        """Delete file - MANUAL"""
        file_upload = FileUpload.query.get(file_id)
        
        if not file_upload:
            return {'error': 'File not found'}, 404
        
        if file_upload.uploader_id != user_id:
            return {'error': 'Unauthorized'}, 403
        
        # Delete from filesystem
        if os.path.exists(file_upload.file_path):
            os.remove(file_upload.file_path)
        
        # Delete from database
        db.session.delete(file_upload)
        db.session.commit()
        
        return {'message': 'File deleted'}, 200
