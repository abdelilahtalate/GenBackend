import json
import os
from app import db
from app.models import Feature

class FeatureService:
    """Feature management service"""
    
    @staticmethod
    def create_feature(project_id, name, feature_type, generation_mode, configuration, schema_definition):
        """Create feature - MANUAL, AI, or MIXED"""
        feature = Feature(
            project_id=project_id,
            name=name,
            feature_type=feature_type,
            generation_mode=generation_mode,
            configuration=configuration or {},
            schema_definition=schema_definition or {}
        )
        
        # AI-assisted logic placeholder
        if generation_mode in ['ai', 'mixed']:
            # Call AI service to generate configuration
            # ai_config = AIService.generate_feature_config(feature_type, configuration)
            # feature.configuration.update(ai_config)
            pass
        
        db.session.add(feature)
        db.session.commit()
        
        return {'feature': feature.to_dict()}, 201
    
    @staticmethod
    def get_project_features(project_id):
        """Get all features for a project - MANUAL"""
        features = Feature.query.filter_by(project_id=project_id).all()
        return {'features': [f.to_dict() for f in features]}, 200
    
    @staticmethod
    def update_feature(feature_id, project_id=None, **kwargs):
        """Update feature - MANUAL"""
        feature = Feature.query.get(feature_id)
        
        if not feature:
            return {'error': 'Feature not found'}, 404
        
        if project_id and feature.project_id != int(project_id):
            return {'error': 'Unauthorized'}, 403
        
        for key, value in kwargs.items():
            if hasattr(feature, key) and value is not None:
                setattr(feature, key, value)
        
        db.session.commit()
        return {'feature': feature.to_dict()}, 200
    
    @staticmethod
    def delete_feature(feature_id, project_id=None):
        """Delete feature - MANUAL"""
        feature = Feature.query.get(feature_id)
        
        if not feature:
            return {'error': 'Feature not found'}, 404
        
        if project_id and feature.project_id != int(project_id):
            return {'error': 'Unauthorized'}, 403
        
        db.session.delete(feature)
        db.session.commit()
        
        return {'message': 'Feature deleted'}, 200

    @staticmethod
    def get_feature_endpoints(project_id, feature_id):
        """Get endpoint metadata for a feature - MANUAL"""
        from app.models.project import Project
        project = Project.query.get(project_id)
        feature = Feature.query.get(feature_id)
        
        if not project or not feature:
            return {'error': 'Project or Feature not found'}, 404
            
        if feature.project_id != project.id:
            return {'error': 'Invalid feature for this project'}, 400
            
        endpoints = []
        base_url = "http://localhost:5000" # Should be dynamic in production
        headers = {
            "X-API-KEY": project.api_key,
            "Content-Type": "application/json"
        }
        
        f_type = feature.feature_type.upper()
        config = feature.configuration or {}
        
        if f_type == 'CRUD':
            table_name = config.get('table', feature.name.lower())
            slug = table_name
            # Focused example: Create
            fields = config.get('fields', [])
            example_body = {f['name']: f.get('default', '') for f in fields if f['name'] != 'id'}
            endpoints.append({
                'method': 'POST',
                'path': f'{slug}',
                'description': f'Create a new {table_name}',
                'body': example_body
            })
            # Focused example: List
            endpoints.append({
                'method': 'GET',
                'path': f'{slug}',
                'description': f'List {table_name} records',
                'body': None
            })
            # Focused example: Update
            endpoints.append({
                'method': 'PUT',
                'path': f'{slug}/1',
                'description': f'Update {table_name} record #1',
                'body': {**example_body, 'id': 1}
            })
            # Focused example: Delete
            endpoints.append({
                'method': 'DELETE',
                'path': f'{slug}/1',
                'description': f'Delete {table_name} record #1',
                'body': None
            })
        elif f_type == 'AUTH':
            endpoints.append({
                'method': 'POST',
                'path': 'auth/register',
                'description': 'Register a new user',
                'body': {'email': 'user@example.com', 'password': 'password123', 'first_name': 'John', 'last_name': 'Doe'}
            })
        elif f_type in ['FUNCTIONS', 'FUNCTION']:
            f_path = config.get('endpoint_path', f"/{feature.name.lower().replace(' ', '_')}")
            method = config.get('http_method', 'POST').upper()
            endpoints.append({
                'method': method,
                'path': f_path.lstrip('/'),
                'description': feature.description or f'Execute {feature.name}',
                'body': config.get('input_schema', {})
            })
        elif f_type == 'ANALYTICS':
            endpoints.append({
                'method': 'GET',
                'path': 'analytics/summary',
                'description': 'Get analytics summary',
                'body': None
            })
        else:
            # Catch-all for other types
            endpoints.append({
                'method': 'GET',
                'path': f"{feature.name.lower().replace(' ', '_')}",
                'description': f'Access {feature.name}',
                'body': None
            })
            
        # Add examples to each endpoint
        for ep in endpoints:
            proxy_url = f"{base_url}/api/features/external/{ep['path']}"
            
            # Generate Curl
            curl_body = f" -d '{json.dumps(ep['body'])}'" if ep['body'] else ""
            ep['curl'] = f"curl -X {ep['method']} {proxy_url} \\\n  -H \"X-API-KEY: {project.api_key}\" \\\n  -H \"Content-Type: application/json\"{curl_body}"
            
            # Generate Raw HTTP
            raw_body = json.dumps(ep['body'], indent=2) if ep['body'] else ""
            headers_str = f"X-API-KEY: {project.api_key}\nContent-Type: application/json"
            ep['raw'] = f"{ep['method']} /api/features/external/{ep['path']} HTTP/1.1\nHost: localhost:5000\n{headers_str}\n\n{raw_body}"
            
            # Generate Postman
            postman = {
                "name": ep['description'],
                "request": {
                    "method": ep['method'],
                    "header": [
                        {"key": "X-API-KEY", "value": project.api_key},
                        {"key": "Content-Type", "value": "application/json"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": raw_body
                    },
                    "url": {
                        "raw": proxy_url,
                        "host": ["localhost"],
                        "port": "5000",
                        "path": ["api", "features", "external"] + ep['path'].split('/')
                    }
                }
            }
            ep['postman'] = json.dumps(postman, indent=2)

        return {
            'project_id': project_id,
            'feature_id': feature_id,
            'base_url': base_url,
            'headers': headers,
            'endpoints': endpoints
        }, 200
