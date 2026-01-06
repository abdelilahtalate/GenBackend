from .base import FeatureHandler
from app.models.test_record import TestRecord
from app import db
import bcrypt
import jwt
from datetime import datetime, timedelta
from flask import current_app

class AuthHandler(FeatureHandler):
    """Handler for testing Authentication features in the wizard"""
    
    def handle(self, method, endpoint, body, schema, context=None):
        user_id = context.get('user_id', 'anon') if context else 'anon'
        project_id = context.get('project_id', 'default') if context else 'default'
        feature_id = f"auth_test_{user_id}"
        clean_endpoint = endpoint.strip('/')
        
        if 'register' in clean_endpoint:
            return self._handle_register(body, feature_id, project_id, schema)
        elif 'login' in clean_endpoint:
            return self._handle_login(body, feature_id, project_id, schema)
        elif 'profile' in clean_endpoint or 'me' in clean_endpoint:
            return self._handle_profile(method, body, feature_id, project_id, schema)
            
        return {
            'status': 400,
            'error': 'Endpoint not found',
            'message': f"Auth endpoint '{endpoint}' not recognized. Try /api/auth/register, /api/auth/login, or /api/auth/profile"
        }, 404

    def _handle_register(self, body, feature_id, project_id, schema):
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return {'error': 'Email and password are required'}, 400
            
        # Strict Validation: Check allowed fields
        extra_fields_config = schema.get('extra_fields', []) if schema else []
        extra_field_names = []
        for f in extra_fields_config:
            fname = f if isinstance(f, str) else f.get('name')
            if fname: extra_field_names.append(fname)
            
        allowed_fields = ['email', 'password'] + extra_field_names
        
        # 1. Check for extra fields
        extra_keys = [k for k in body.keys() if k not in allowed_fields]
        if extra_keys:
            return {
                'status': 400,
                'message': f"Unexpected fields: {', '.join(extra_keys)}"
            }, 400

        # 2. Check for missing required extra fields
        required_extras = []
        for f in extra_fields_config:
            if isinstance(f, dict) and f.get('required') and f.get('name'):
                required_extras.append(f.get('name'))
                
        missing_extras = [f for f in required_extras if f not in body]
        if missing_extras:
            return {
                'status': 400,
                'message': f"Missing required fields: {', '.join(missing_extras)}"
            }, 400

        records = TestRecord.query.filter_by(feature_id=feature_id, project_id=project_id).all()
        has_username = 'username' in extra_field_names
        
        for r in records:
            if r.data.get('email') == email:
                return {'error': 'Email already exists'}, 400
            if has_username and r.data.get('username') == body.get('username'):
                return {'error': 'Username already exists'}, 400
        
        pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        user_data = {
            'id': len(records) + 1,
            'email': email,
            'password_hash': pw_hash,
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Add validated extra fields
        for fname in extra_field_names:
            if fname and fname not in ['email', 'password', 'id']:
                user_data[fname] = body.get(fname)

        record = TestRecord(feature_id=feature_id, project_id=project_id, data=user_data)
        db.session.add(record)
        db.session.commit()
        
        resp_data = user_data.copy()
        resp_data.pop('password_hash')
        
        return {
            'message': 'User registered in test environment',
            'user': resp_data
        }, 201

    def _handle_login(self, body, feature_id, project_id, schema):
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return {'error': 'Email and password are required'}, 400
            
        records = TestRecord.query.filter_by(feature_id=feature_id, project_id=project_id).all()
        extra_fields_config = schema.get('extra_fields', []) if schema else []
        has_username = any((f if isinstance(f, str) else f.get('name')) == 'username' for f in extra_fields_config)
        
        user_record = None
        for r in records:
            # Check email
            if r.data.get('email') == body.get('email'):
                user_record = r
                break
            # Or check username if supported
            if has_username and r.data.get('username') == body.get('username'):
                user_record = r
                break
                
        if not user_record or not bcrypt.checkpw(password.encode('utf-8'), user_record.data.get('password_hash').encode('utf-8')):
            return {'error': 'Invalid credentials'}, 401
            
        # Generate a mock token
        token = jwt.encode({
            'user_id': user_record.data.get('id'),
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, current_app.config.get('SECRET_KEY', 'test-secret'), algorithm='HS256')
        
        user_data = user_record.data.copy()
        user_data.pop('password_hash')
        
        return {
            'message': 'Login successful (test environment)',
            'access_token': token,
            'user': user_data
        }, 200

    def _handle_profile(self, method, body, feature_id, project_id, schema):
        # In a real app we'd get user_id from token
        # For wizard testing, we'll just return the last registered user or a placeholder
        records = TestRecord.query.filter_by(feature_id=feature_id, project_id=project_id).order_by(TestRecord.id.desc()).first()
        
        if not records:
            return {'error': 'No users found in test environment'}, 404
            
        user_data = records.data.copy()
        user_data.pop('password_hash')
        
        return {
            'user': user_data
        }, 200
