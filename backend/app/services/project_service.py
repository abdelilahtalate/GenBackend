from app import db
from app.models import Project
import secrets
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm.attributes import flag_modified

logger = logging.getLogger(__name__)

class ProjectService:
    """Project management service"""
    
    @staticmethod
    def create_project(user_id, name, description, generation_mode):
        """Create new project - MANUAL"""
        api_key = secrets.token_urlsafe(32)
        
        project = Project(
            name=name,
            description=description,
            owner_id=user_id,
            generation_mode=generation_mode,
            api_key=api_key
        )
        
        db.session.add(project)
        db.session.commit()
        
        return {'project': project.to_dict()}, 201
    
    @staticmethod
    def get_user_projects(user_id, limit=50, offset=0):
        """Get all projects for a user - MANUAL"""
        projects = Project.query.filter_by(owner_id=user_id).filter(Project.status != 'deleted').order_by(Project.updated_at.desc()).limit(limit).offset(offset).all()
        total = Project.query.filter_by(owner_id=user_id).filter(Project.status != 'deleted').count()
        
        project_list = []
        for p in projects:
            p_dict = p.to_dict()
            p_dict['featureCount'] = p.features.count() + p.functions.count()
            project_list.append(p_dict)
            
        return {
            'projects': project_list,
            'total': total,
            'limit': limit,
            'offset': offset
        }, 200
    
    @staticmethod
    def get_project(project_id, user_id=None):
        """Get project by ID - MANUAL"""
        project = Project.query.get(project_id)
        
        if not project:
            return {'error': 'Project not found'}, 404
        
        if user_id and project.owner_id != int(user_id):
            return {'error': 'Unauthorized'}, 403
        
        return {'project': project.to_dict()}, 200
    
    @staticmethod
    def update_project(project_id, user_id, name=None, description=None, status=None):
        """Update project - MANUAL"""
        project = Project.query.get(project_id)
        
        if not project:
            return {'error': 'Project not found'}, 404
        
        if project.owner_id != int(user_id):
            return {'error': 'Unauthorized'}, 403
        
        if name:
            project.name = name
        if description:
            project.description = description
        if status:
            project.status = status
        
        db.session.commit()
        return {'project': project.to_dict()}, 200
    
    @staticmethod
    def delete_project(project_id, user_id):
        """Delete project - MANUAL (Soft delete)"""
        project = Project.query.get(project_id)
        
        if not project:
            return {'error': 'Project not found'}, 404
        
        if project.owner_id != int(user_id):
            return {'error': 'Unauthorized'}, 403
        
        # Soft delete: set status to 'deleted' instead of removing from database
        project.status = 'deleted'
        db.session.commit()
        
        return {'message': 'Project deleted'}, 200

    @staticmethod
    def regenerate_api_key(project_id, user_id):
        """Regenerate project API key - MANUAL"""
        project = Project.query.get(project_id)
        
        if not project:
            return {'error': 'Project not found'}, 404
        
        if project.owner_id != int(user_id):
            return {'error': 'Unauthorized'}, 403
            
        new_key = secrets.token_urlsafe(32)
        project.api_key = new_key
        db.session.commit()
        
        return {'api_key': new_key, 'message': 'API key regenerated successfully'}, 200
        
    @staticmethod
    def get_user_stats(user_id):
        """Get project statistics for user - MANUAL"""
        from app.models import Project, Feature, CustomFunction
        
        # Project counts
        total_projects = Project.query.filter_by(owner_id=user_id).count()
        completed_projects = Project.query.filter_by(owner_id=user_id, status='completed').count()
        draft_projects = Project.query.filter_by(owner_id=user_id, status='draft').count()
        deleted_projects = Project.query.filter_by(owner_id=user_id, status='deleted').count()
        
        # Feature counts details
        crud_count = Feature.query.join(Project).filter(Project.owner_id == user_id, Feature.feature_type == 'CRUD').count()
        auth_count = Feature.query.join(Project).filter(Project.owner_id == user_id, Feature.feature_type == 'AUTH').count()
        # Functions are stored in CustomFunction table
        function_count = CustomFunction.query.join(Project).filter(Project.owner_id == user_id).count() 
        # Analytics or others if any
        analytics_count = Feature.query.join(Project).filter(Project.owner_id == user_id, Feature.feature_type == 'ANALYTICS').count()

        # Update totals logic to be consistent
        total_features = Feature.query.join(Project).filter(Project.owner_id == user_id).count()
        
        # Estimate API endpoints
        total_apis = (total_features * 5) + function_count

        # Count Test Records (Internal - wizard)
        from app.models.test_record import TestRecord
        user_project_ids = [str(p.id) for p in Project.query.filter_by(owner_id=user_id).all()]
        total_tests = TestRecord.query.filter(TestRecord.project_id.in_(user_project_ids)).count() if user_project_ids else 0
        
        # External API Usage Metrics
        from app.models.api_request_log import ApiRequestLog
        from sqlalchemy import func
        
        real_project_ids = [p.id for p in Project.query.filter_by(owner_id=user_id).all()]
        total_external_tests = ApiRequestLog.query.filter(ApiRequestLog.project_id.in_(real_project_ids)).count() if real_project_ids else 0
        
        # API Usage by Day (Last 14 days)
        fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
        daily_usage = db.session.query(
            func.date(ApiRequestLog.created_at).label('date'),
            func.count(ApiRequestLog.id).label('count')
        ).filter(
            ApiRequestLog.project_id.in_(real_project_ids),
            ApiRequestLog.created_at >= fourteen_days_ago
        ).group_by(func.date(ApiRequestLog.created_at)).all() if real_project_ids else []
        
        api_usage_by_day = [{'date': str(d.date), 'count': d.count} for d in daily_usage]
        
        # API Usage by Feature
        feature_usage = db.session.query(
            Feature.name,
            func.count(ApiRequestLog.id).label('count')
        ).join(ApiRequestLog, ApiRequestLog.feature_id == Feature.id).filter(
            ApiRequestLog.project_id.in_(real_project_ids)
        ).group_by(Feature.name).all() if real_project_ids else []
        
        api_usage_by_feature = {f.name: f.count for f in feature_usage}

        return {
            'totalProjects': total_projects,
            'completedProjects': completed_projects,
            'draftProjects': draft_projects,
            'deletedProjects': deleted_projects,
            'totalFeatures': total_features + function_count,
            'totalApis': total_apis,
            'totalTests': total_tests,
            'totalExternalTests': total_external_tests,
            'apiUsageByDay': api_usage_by_day,
            'apiUsageByFeature': api_usage_by_feature,
            'featuresByType': {
                'CRUD': crud_count,
                'Auth': auth_count,
                'Functions': function_count,
                'Analytics': analytics_count
            }
        }, 200
    @staticmethod
    def sync_from_files(project_id, user_id, files):
        """Sync manual code edits back to feature configurations - MANUAL"""
        from app.models import Project, Feature, CustomFunction
        import re
        
        project = Project.query.get(project_id)
        if not project:
            return {'error': 'Project not found'}, 404
        if project.owner_id != int(user_id):
            return {'error': 'Unauthorized'}, 403
            
        updated_features = []
        
        # 1. Sync Functions Logic from app/routes/functions.py
        functions_file = files.get('app/routes/functions.py')
        if functions_file:
            logger.info("Syncing functions from file...")
            # Sync CustomFunction table (Manual Mode)
            custom_functions = CustomFunction.query.filter_by(project_id=project_id).all()
            for fn in custom_functions:
                if _sync_function_logic(fn, functions_file, 'name'):
                    updated_features.append(fn.name)
            
            # Sync Feature table (Chat/AI Mode)
            # Function features usually have type 'FUNCTIONS' or 'FUNCTION'
            function_features = Feature.query.filter_by(project_id=project_id).filter(
                Feature.feature_type.in_(['FUNCTIONS', 'FUNCTION', 'CUSTOM_FUNCTION', 'AI ENDPOINTS'])
            ).all()
            
            for feat in function_features:
                # Features store name in feat.name, but usually normalized in config
                # We need to find the function name used in the route: route_{name}
                # Generator uses: fn_name = config.get('name', original_name.lower().replace(' ', '_'))
                if _sync_function_logic(feat, functions_file, 'feature'):
                    updated_features.append(feat.name)

        # 2. Sync CRUD Models from app/models/crud.py
        crud_file = files.get('app/models/crud.py')
        if crud_file:
             logger.info("Syncing CRUD models from file...")
             crud_features = Feature.query.filter_by(project_id=project_id).filter(
                 Feature.feature_type.in_(['CRUD', 'DATABASE', 'RESOURCE'])
             ).all()
             for feat in crud_features:
                 if _sync_crud_model_logic(feat, crud_file):
                     updated_features.append(feat.name)
                     flag_modified(feat, 'configuration')
                     
        # 3. Sync Auth Model from app/models/user.py
        user_file = files.get('app/models/user.py')
        if user_file:
            logger.info("Syncing Auth model from file...")
            auth_feature = Feature.query.filter_by(project_id=project_id).filter(
                Feature.feature_type.in_(['AUTH', 'AUTHENTICATION'])
            ).first()
            if auth_feature and _sync_auth_model_logic(auth_feature, user_file):
                updated_features.append(auth_feature.name)
                flag_modified(auth_feature, 'configuration')

        db.session.commit()
        logger.info(f"Sync complete. Updated features: {updated_features}")
        
        return {
            'success': True,
            'updated': updated_features,
            'message': f"Synchronized {len(updated_features)} features from files."
        }, 200

def _sync_function_logic(entity, file_content, entity_type):
    """Helper to extract and update function logic"""
    import re
    # Determine function name as it appears in the route
    if entity_type == 'feature':
        config = entity.configuration or {}
        fn_name = config.get('name', entity.name.lower().replace(' ', '_'))
    else:
        fn_name = entity.name
        config = entity.configuration or {}

    # Look for the function block
    pattern = rf"def route_{fn_name}\(\):.*?\n\s+input_data = .*?\n(.*?)(?=\n@api_bp\.route|\Z)"
    match = re.search(pattern, file_content, re.DOTALL)
    
    if match:
        body = match.group(1)
        # Unindent
        lines = body.split('\n')
        unindented_lines = []
        for line in lines:
            if line.startswith('    '):
                unindented_lines.append(line[4:])
            elif not line.strip():
                unindented_lines.append('')
            else:
                unindented_lines.append(line)
        
        new_code = '\n'.join(unindented_lines).strip()
        
        # Update config if changed
        if config.get('code') != new_code:
            config['code'] = new_code
            entity.configuration = config
            return True
            
    return False

def _sync_crud_model_logic(feature, file_content):
    """Helper to sync CRUD model fields from code to config"""
    import re
    
    config = feature.configuration or {}
    # Determine expected class name
    table_name = config.get('table', feature.name.lower())
    class_name_expected = table_name.capitalize() # Heuristic, but consistent with generator
    
    # 1. Find class definition
    # Pattern: class Book(db.Model):
    # or class Book( db.Model ):
    class_pattern = rf"class\s+(?P<name>\w+)\s*\(\s*db\.Model\s*\):"
    
    # We need to find the specific class for this feature
    # If the feature name matches the class, or table name matches
    # We scan all classes in the file
    
    matches = list(re.finditer(class_pattern, file_content))
    target_block = None
    
    for i, match in enumerate(matches):
        found_class = match.group('name')
        # Check against both class name AND table name (simple plural/singular heuristic)
        if (found_class.upper() == class_name_expected.upper() or 
            found_class.upper() == feature.name.upper() or
            found_class.lower() == feature.name.lower().replace(' ', '') or 
            found_class.lower() == config.get('table', '').lower()):
            
            # Found the class start
            start_idx = match.end()
            # Find end of this block (start of next class or end of file)
            end_idx = matches[i+1].start() if i+1 < len(matches) else len(file_content)
            target_block = file_content[start_idx:end_idx]
            break
            
    if not target_block:
        logger.warning(f"Could not find class definition for feature: {feature.name} (Expected class: {class_name_expected})")
        return False
        
    # 2. Parse fields from target_block
    # Pattern: name = db.Column(db.String(120), nullable=False)
    # We look for assignments to db.Column
    field_pattern = r"(?P<name>\w+)\s*=\s*db\.Column\((?P<args>.*?)\)"
    
    found_fields = []
    
    for f_match in re.finditer(field_pattern, target_block):
        f_name = f_match.group('name')
        f_args = f_match.group('args')
        
        # Skip standard fields
        if f_name in ['id', 'owner_id', 'created_at', 'updated_at']:
            continue
            
        # Parse Type
        f_type = 'string' # default
        if 'db.Integer' in f_args: f_type = 'integer'
        elif 'db.Boolean' in f_args: f_type = 'boolean'
        elif 'db.DateTime' in f_args: f_type = 'datetime'
        elif 'db.Text' in f_args: f_type = 'text'
        elif 'db.Float' in f_args: f_type = 'float'
        
        # Parse Required
        f_required = 'nullable=False' in f_args
        
        found_fields.append({
            'name': f_name,
            'type': f_type,
            'required': f_required
        })
        
    # 3. Compare and Update
    current_fields = config.get('fields', [])
    
    import json
    # Sort by name for reliable comparison
    current_fields.sort(key=lambda x: x['name'])
    found_fields.sort(key=lambda x: x['name'])
    
    if json.dumps(current_fields, sort_keys=True) != json.dumps(found_fields, sort_keys=True):
        logger.info(f"Updating fields for {feature.name}. Found: {len(found_fields)}, Was: {len(current_fields)}")
        config['fields'] = found_fields
        feature.configuration = config
        from app.models import db
        # Mark as modified
        feature.updated_at = db.func.now()
        return True
        
    return False

def _sync_auth_model_logic(feature, file_content):
    """Helper to sync Auth User model extra fields"""
    import re
    
    config = feature.configuration or {}
    
    # 1. Find User class
    class_pattern = rf"class\s+User\s*\(\s*db\.Model\s*\):"
    match = re.search(class_pattern, file_content)
    
    if not match:
        return False
        
    # Extract block
    start_idx = match.end()
    # Assuming User is likely the only class or first class, but let's be safe
    # Find next class or end
    next_class = re.search(r"class\s+\w+\s*\(", file_content[start_idx:])
    end_idx = (start_idx + next_class.start()) if next_class else len(file_content)
    target_block = file_content[start_idx:end_idx]
    
    # 2. Parse fields
    field_pattern = r"(?P<name>\w+)\s*=\s*db\.Column\((?P<args>.*?)\)"
    
    found_extra_fields = []
    
    for f_match in re.finditer(field_pattern, target_block):
        f_name = f_match.group('name')
        f_args = f_match.group('args')
        
        # Skip Auth Core fields
        if f_name in ['id', 'email', 'password_hash', 'created_at']:
            continue
            
        # Parse Type
        f_type = 'string'
        if 'db.Integer' in f_args: f_type = 'integer'
        elif 'db.Boolean' in f_args: f_type = 'boolean'
        elif 'db.DateTime' in f_args: f_type = 'datetime'
        elif 'db.Text' in f_args: f_type = 'text'
        
        f_required = 'nullable=False' in f_args
        
        found_extra_fields.append({
            'name': f_name,
            'type': f_type,
            'required': f_required
        })
        
    # 3. Update Config
    current_extra = config.get('extra_fields', [])
    
    import json
    if json.dumps(current_extra, sort_keys=True) != json.dumps(found_extra_fields, sort_keys=True):
        config['extra_fields'] = found_extra_fields
        feature.configuration = config
        return True
        
    return False
