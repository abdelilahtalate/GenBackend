from app import db
from app.models import User, Role
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import timedelta

class AuthService:
    """Authentication service"""
    
    @staticmethod
    def register_user(email, password, first_name, last_name):
        """Register new user - MANUAL"""
        if User.query.filter_by(email=email).first():
            return {'error': 'User already exists'}, 400
        
        # Get default 'user' role
        user_role = Role.query.filter_by(name='user').first()
        if not user_role:
            user_role = Role(name='user', description='Regular user')
            db.session.add(user_role)
            db.session.commit()
        
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role_id=user_role.id
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return {'message': 'User registered successfully', 'user': user.to_dict()}, 201
    
    @staticmethod
    def login_user(email, password):
        """Login user - MANUAL"""
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return {'error': 'Invalid credentials'}, 401
        
        if not user.is_active:
            return {'error': 'User account is inactive'}, 403
        
        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=1))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, 200
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID - MANUAL"""
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return {'user': user.to_dict()}, 200
    
    @staticmethod
    def update_user_profile(user_id, first_name, last_name):
        """Update user profile - MANUAL"""
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        user.first_name = first_name
        user.last_name = last_name
        db.session.commit()
        
        return {'message': 'Profile updated', 'user': user.to_dict()}, 200
    
    @staticmethod
    def change_password(user_id, old_password, new_password):
        """Change password - MANUAL"""
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        if not user.check_password(old_password):
            return {'error': 'Invalid current password'}, 401
        
        user.set_password(new_password)
        db.session.commit()
        
        return {'message': 'Password changed successfully'}, 200
