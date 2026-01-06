from .base import FeatureHandler
from app.models.test_record import TestRecord
from app import db
import uuid

class CRUDHandler(FeatureHandler):
    """Handler for CRUD features with persistent storage"""
    
    def handle(self, method, endpoint, body, schema, context=None):
        # Isolation by user_id and project_id
        user_id = context.get('user_id', 'anon') if context else 'anon'
        project_id = context.get('project_id', 'default') if context else 'default'
        table_name = schema.get('table', 'default_table') if schema else 'default'
        feature_id = f"crud_{user_id}_{table_name}"

        # Validate that the endpoint matches the table name
        # Expected format: /api/{table_name} or /api/{table_name}/{id}
        # We strip leading/trailing slashes and split
        clean_endpoint = endpoint.strip('/')
        parts = clean_endpoint.split('/')
        
        # parts might be ['api', 'users'] or ['api', 'users', '1']
        # We check if the segment after 'api' (or the first segment if no api prefix) matches table_name
        resource_name = parts[1] if len(parts) > 1 and parts[0] == 'api' else parts[0]
        
        if resource_name.lower() != table_name.lower():
            return {
                'status': 404,
                'error': 'Not Found', 
                'message': f"Endpoint '{endpoint}' does not match table '{table_name}'"
            }, 404

        if method == 'GET':
            # Query valid test records for this feature and project
            records = TestRecord.query.filter_by(feature_id=feature_id, project_id=project_id).all()
            
            # Strict Output Filtering
            allowed_fields = [f['name'] for f in schema.get('fields', [])] + ['id']
            cleaned_items = []
            for record in records:
                cleaned = {k: v for k, v in record.data.items() if k in allowed_fields}
                cleaned_items.append(cleaned)
            
            # If endpoint looks like /item/1, filter by ID (simplistic)
            parts = endpoint.split('/')
            if parts and parts[-1].isdigit():
                 target_id = int(parts[-1])
                 found = next((item for item in cleaned_items if item.get('id') == target_id), None)
                 if found:
                     return {
                        'status': 200, 
                        'data': found,
                        'message': f'Record {target_id} retrieved'
                    }, 200
                 else:
                     return {'error': 'Not found'}, 404

            return {
                'status': 200, 
                'data': {'items': cleaned_items, 'count': len(cleaned_items)},
                'message': f'Retrieved {len(cleaned_items)} records'
            }, 200
            
        elif method == 'POST':
            fields_config = schema.get('fields', [])
            allowed_fields = [f['name'] for f in fields_config]
            required_fields = [f['name'] for f in fields_config if f.get('required')]
            
            # 1. Check for extra fields
            extra_fields = [k for k in body.keys() if k not in allowed_fields and k != 'id']
            if extra_fields:
                 return {
                    'status': 400,
                    'message': f"Unexpected fields: {', '.join(extra_fields)}"
                }, 400

            # 2. Check for missing required fields
            missing_fields = [f for f in required_fields if f not in body]
            if missing_fields:
                 return {
                    'status': 400,
                    'message': f"Missing required fields: {', '.join(missing_fields)}"
                }, 400
            
            # Simulate ID generation
            new_id = body.get('id')
            if not new_id:
                count = TestRecord.query.filter_by(feature_id=feature_id, project_id=project_id).count()
                new_id = count + 1
            
            body['id'] = new_id
            
            # Save strictly valid body
            record = TestRecord(feature_id=feature_id, project_id=project_id, data=body)
            db.session.add(record)
            db.session.commit()
                
            return {
                'status': 201, 
                'data': body, 
                'message': 'Resource created and stored permanently'
            }, 201
            
        elif method == 'PUT':
             fields_config = schema.get('fields', [])
             allowed_fields = [f['name'] for f in fields_config]
             
             # Check for extra fields
             extra_fields = [k for k in body.keys() if k not in allowed_fields and k != 'id']
             if extra_fields:
                 return {
                    'status': 400,
                    'message': f"Unexpected fields: {', '.join(extra_fields)}"
                }, 400

             target_id = body.get('id')
             if target_id:
                 records = TestRecord.query.filter_by(feature_id=feature_id, project_id=project_id).all()
                 target_record = None
                 for r in records:
                     if r.data.get('id') == target_id:
                         target_record = r
                         break
                 
                 if target_record:
                     target_record.data = body
                     db.session.commit()
                     return {
                        'status': 200, 
                        'data': body, 
                        'message': f'Resource {target_id} updated'
                     }, 200
             
             return {'error': 'Resource not found or ID missing'}, 404
            
        elif method == 'DELETE':
            # Similar logic to PUT for finding the record
             parts = endpoint.split('/')
             if parts and parts[-1].isdigit():
                 target_id = int(parts[-1])
                 records = TestRecord.query.filter_by(feature_id=feature_id, project_id=project_id).all()
                 for r in records:
                     if r.data.get('id') == target_id:
                         db.session.delete(r)
                         db.session.commit()
                         return {
                            'status': 204, 
                            'data': {}, 
                            'message': f'Resource {target_id} deleted'
                         }, 200
             return {'error': 'Resource not found'}, 404

        return {'error': 'Method not supported'}, 400
