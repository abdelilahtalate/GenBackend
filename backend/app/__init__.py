from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config.settings import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='development'):
    app = Flask(__name__)

    app.config.from_object(config.get(config_name))
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Enable CORS
    CORS(
        app,
        resources={r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "X-API-KEY"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 3600
        }}
    )
    # CORS(app, resources={
    #     r"/api/*": {
    #         "origins": [app.config.get('FRONTEND_URL', 'http://localhost:3000'), "http://localhost:3000"],
    #         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    #         "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
    #         "supports_credentials": True
    #     }
    # })
    
    # Register blueprints
    from app.routes import auth_bp, projects_bp, features_bp, functions_bp, analytics_bp, files_bp, tasks_bp, ai_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(features_bp)
    app.register_blueprint(functions_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(files_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(ai_bp)
    
    # Register models for migration
    from app.models.test_record import TestRecord
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return {'status': 'ok'}, 200
    
    return app
