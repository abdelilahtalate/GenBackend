import os
import io
import zipfile
import json

class GeneratorService:
    @staticmethod
    def get_project_files(project_info, features):
        """
        Generates a dictionary of project files and their contents.
        """
        has_auth = GeneratorService._has_auth(features)
        has_analytics = GeneratorService._has_analytics(features)
        
        files = {
            'requirements.txt': GeneratorService._generate_requirements(features),
            'run.py': GeneratorService._generate_run_py(),
            '.env.example': GeneratorService._generate_env(project_info),
            'README.md': GeneratorService._generate_readme(project_info),
            '.gitignore': GeneratorService._get_gitignore(),
            'app/__init__.py': GeneratorService._generate_app_init(features),
            'app/config.py': GeneratorService._generate_config(features),
            'app/models/__init__.py': GeneratorService._generate_models_init(features),
            'app/models/crud.py': GeneratorService._generate_crud_models(features),
            'app/routes/__init__.py': GeneratorService._generate_routes_init(features),
            'app/routes/crud.py': GeneratorService._generate_crud_routes(features),
            'app/routes/functions.py': GeneratorService._generate_function_routes(features),
        }
        
        if has_auth:
            files['app/models/user.py'] = GeneratorService._generate_user_model(features)
            files['app/routes/auth.py'] = GeneratorService._generate_auth_routes(features)
            
        if has_analytics:
            files['app/routes/analytics.py'] = GeneratorService._generate_analytics_routes(features)
            
        return files

    @staticmethod
    def generate_project(project_info, features):
        """
        Generates a Flask project as a zip file in-memory.
        """
        files = GeneratorService.get_project_files(project_info, features)
        
        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            for path, content in files.items():
                zf.writestr(path, content)
                
        memory_file.seek(0)
        return memory_file

    @staticmethod
    def _has_auth(features):
        return GeneratorService._get_auth_feature(features) is not None

    @staticmethod
    def _get_auth_feature(features):
        for f in features:
            f_type = str(f.get('type') or f.get('feature_type') or '').upper()
            f_name = str(f.get('name') or '').upper()
            
            # Explicit type check first
            if f_type == 'AUTH' or f_type == 'AUTHENTICATION':
                return f
            
            # Fallback to name-based if name clearly indicates Auth
            if 'AUTHENTICATION' in f_name or 'AUTH' == f_name or 'JWT' in f_name:
                return f
        return None

    @staticmethod
    def _has_analytics(features):
        return GeneratorService._get_analytics_feature(features) is not None

    @staticmethod
    def _get_analytics_feature(features):
        for f in features:
            f_type = str(f.get('type') or f.get('feature_type') or f.get('name') or '').upper()
            if f_type in ['ANALYTICS', 'TRACKING']:
                return f
        return None

    @staticmethod
    def _generate_requirements(features):
        reqs = """Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.5
Flask-Cors==4.0.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
"""
        if GeneratorService._has_auth(features):
            reqs += "Flask-JWT-Extended==4.6.0\nbcrypt==4.1.2\n"
        return reqs

    @staticmethod
    def _generate_run_py():
        return """from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
"""

    @staticmethod
    def _generate_env(info):
        return f"""FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite:///app.db
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/{info.get('name', 'myapp').lower().replace(' ', '_')}
"""

    @staticmethod
    def _generate_readme(info):
        name = info.get('name', 'My Project')
        return f"""# {name}

Generated Flask Backend

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Run the application:
   ```bash
   python run.py
   ```

## API Endpoints

Explore the `app/routes/` directory to see all available endpoints:
- `app/routes/auth.py`: User registration, login, and profile.
- `app/routes/analytics.py`: Event tracking and statistics.
- `app/routes/crud.py`: Database resource endpoints.
- `app/routes/functions.py`: Your custom business logic endpoints.
"""

    @staticmethod
    def _generate_app_init(features):
        has_auth = GeneratorService._has_auth(features)
        code = """from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
"""
        if has_auth:
            code += "from flask_jwt_extended import JWTManager\n\njwt = JWTManager()\n"
        
        code += """
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    CORS(app)
"""
        if has_auth:
            code += "    jwt.init_app(app)\n"
            
        code += """
    from app.routes import api_bp
    app.register_blueprint(api_bp)

    return app
"""
        return code

    @staticmethod
    def _generate_config(features):
        code = """import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
"""
        if GeneratorService._has_auth(features):
            code += "    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-it'\n"
        return code

    @staticmethod
    def _generate_models_init(features):
        code = "from app import db\n\n"
        if GeneratorService._has_auth(features):
            code += "from app.models.user import User\n"
        code += "from app.models.crud import *\n"
        return code

    @staticmethod
    def _generate_user_model(features):
        auth_feature = GeneratorService._get_auth_feature(features)
        config = auth_feature.get('config') or auth_feature.get('configuration') or {}
        extra_fields = config.get('extra_fields', [])
        
        code = "from app import db\nfrom datetime import datetime\n\n"
        code += "class User(db.Model):\n"
        code += "    __tablename__ = 'users'\n"
        code += "    id = db.Column(db.Integer, primary_key=True)\n"
        code += "    email = db.Column(db.String(120), unique=True, nullable=False)\n"
        code += "    password_hash = db.Column(db.String(256), nullable=False)\n"
        
        processed_fields = []
        for field in extra_fields:
            if isinstance(field, str):
                fname = field
                ftype = 'string'
                required = False
            else:
                fname = field.get('name')
                ftype = field.get('type', 'string')
                required = field.get('required', False)
                
            if fname and fname not in ['email', 'password', 'id'] and fname not in processed_fields:
                processed_fields.append(fname)
                col_type = "db.String(120)"
                if ftype == 'integer': col_type = "db.Integer"
                elif ftype == 'boolean': col_type = "db.Boolean"
                elif ftype == 'datetime': col_type = "db.DateTime"
                
                unique = ", unique=True" if fname == 'username' else ""
                nullable = ", nullable=False" if required or fname == 'username' else ""
                code += f"    {fname} = db.Column({col_type}{unique}{nullable})\n"
                
        code += "    created_at = db.Column(db.DateTime, default=datetime.utcnow)\n\n"
        
        code += "    def to_dict(self):\n"
        code += "        data = {\n"
        code += "            'id': self.id,\n"
        code += "            'email': self.email,\n"
        code += "            'created_at': self.created_at.isoformat()\n"
        code += "        }\n"
        
        processed_to_dict = []
        for field in extra_fields:
            fname = field if isinstance(field, str) else field.get('name')
            if fname and fname not in ['email', 'password', 'id'] and fname not in processed_to_dict:
                processed_to_dict.append(fname)
                code += f"        data['{fname}'] = self.{fname}\n"
                
        code += "        return data\n"
        return code

    @staticmethod
    def _generate_crud_models(features):
        code = "from app import db\nfrom datetime import datetime\n\n"
        has_auth = GeneratorService._has_auth(features)
        
        for feature in features:
            original_name = feature.get('name', 'Unknown')
            f_type = str(feature.get('type') or feature.get('feature_type') or original_name).upper()
            
            if f_type in ['CRUD', 'DATABASE', 'RESOURCE']:
                config = feature.get('config') or feature.get('configuration') or {}
                table_name = config.get('table', original_name.lower())
                class_name = table_name.capitalize()
                
                code += f"class {class_name}(db.Model):\n"
                code += f"    __tablename__ = '{table_name}'\n\n"
                
                # Primary Key (default assumption)
                code += "    id = db.Column(db.Integer, primary_key=True)\n"
                
                if GeneratorService._has_auth(features):
                    code += "    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))\n"

                fields = config.get('fields', [])
                for field in fields:
                    fname = field['name']
                    # Skip ID if defined in fields (already added)
                    if fname == 'id':
                        continue
                        
                    ftype = field['type']
                    col_def = "db.Column("
                    
                    if ftype == 'string':
                        col_def += "db.String(120)"
                    elif ftype == 'integer':
                        col_def += "db.Integer"
                    elif ftype == 'boolean':
                        col_def += "db.Boolean"
                    elif ftype == 'datetime':
                        col_def += "db.DateTime, default=datetime.utcnow"
                    else:
                        col_def += "db.String(120)"
                        
                    if field.get('required'):
                        col_def += ", nullable=False"
                        
                    col_def += ")"
                    code += f"    {fname} = {col_def}\n"
                
                code += "\n    def to_dict(self):\n"
                code += "        return {\n"
                code += "            'id': self.id,\n"
                if GeneratorService._has_auth(features):
                    code += "            'owner_id': self.owner_id,\n"
                for field in fields:
                    fname = field['name']
                    if fname == 'id': continue
                    if field['type'] == 'datetime':
                         code += f"            '{fname}': self.{fname}.isoformat() if self.{fname} else None,\n"
                    else:
                         code += f"            '{fname}': self.{fname},\n"
                code += "        }\n\n"
                
        return code

    @staticmethod
    def _generate_routes_init(features):
        has_auth = GeneratorService._has_auth(features)
        code = "from flask import Blueprint\n\napi_bp = Blueprint('api', __name__, url_prefix='/api')\n\n"
        code += "from app.routes.crud import *\n"
        code += "from app.routes.functions import *\n"
        if has_auth:
            code += "from app.routes.auth import *\n"
        if GeneratorService._has_analytics(features):
            code += "from app.routes.analytics import *\n"
        return code

    @staticmethod
    def _generate_auth_routes(features):
        auth_feature = GeneratorService._get_auth_feature(features)
        config = auth_feature.get('config') or auth_feature.get('configuration') or {}
        extra_fields = config.get('extra_fields', [])
        has_username = any((f if isinstance(f, str) else f.get('name')) == 'username' for f in extra_fields)
        
        code = """from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from app import db
from app.models.user import User
from app.routes import api_bp

@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already exists'}), 400
"""
        if has_username:
            code += """    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': 'Username already exists'}), 400
"""
            
        code += """    
    hashed = bcrypt.hashpw(data.get('password').encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = User(email=data.get('email'), password_hash=hashed)
"""
        processed_register = []
        for field in extra_fields:
            fname = field if isinstance(field, str) else field.get('name')
            if fname and fname not in ['email', 'password', 'id'] and fname not in processed_register:
                processed_register.append(fname)
                code += f"    if '{fname}' in data: user.{fname} = data['{fname}']\n"
                
        code += """
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
"""
        if has_username:
            code += """    # Support login by email or username
    user = User.query.filter((User.email == data.get('email')) | (User.username == data.get('username'))).first()
"""
        else:
            code += "    user = User.query.filter_by(email=data.get('email')).first()\n"
            
        code += """    if user and bcrypt.checkpw(data.get('password').encode('utf-8'), user.password_hash.encode('utf-8')):
        token = create_access_token(identity=str(user.id))
        return jsonify({'token': token, 'user': user.to_dict()})
    return jsonify({'error': 'Invalid credentials'}), 401

@api_bp.route('/auth/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify(user.to_dict())
"""
        return code

    @staticmethod
    def _generate_analytics_routes(features):
        analytics_feature = GeneratorService._get_analytics_feature(features)
        config = analytics_feature.get('config') or analytics_feature.get('configuration') or {}
        reports = config.get('reports', [])

        code = """from flask import request, jsonify
from app import db
from app.models import *
from app.routes import api_bp
from sqlalchemy import func

@api_bp.route('/analytics/summary', methods=['GET'])
def get_analytics_summary():
    results = {}
"""
        for report in reports:
            name = report.get('name', 'Report')
            entity = report.get('entity')
            mode = report.get('mode', 'simple')
            
            if not entity: continue
            
            # Map table name to class name
            class_name = entity.capitalize()
            
            if mode == 'advanced':
                expr = report.get('expression', '')
                if expr:
                    # Use text() for raw SQL-like expressions
                    # We wrap it in a subquery or execute directly
                    code += f"    # Advanced Expression: {expr}\n"
                    code += f"    query = db.session.query(db.text('{expr}')).select_from({class_name})\n"
                    code += f"    results['{name}'] = query.scalar() or 0\n"
            else:
                agg_type = report.get('type', 'count')
                field = report.get('field', 'id')
                group_by = report.get('group_by')
                
                if group_by:
                    agg_fn = f"func.{agg_type}" if agg_type != 'count' else "func.count"
                    agg_target = f"{class_name}.{field}" if agg_type != 'count' else f"{class_name}.id"
                    code += f"    # Grouped Aggregation: {agg_type} of {field} by {group_by}\n"
                    code += f"    query = db.session.query({class_name}.{group_by}, {agg_fn}({agg_target})).group_by({class_name}.{group_by}).all()\n"
                    code += f"    results['{name}'] = {{str(row[0]): row[1] for row in query}}\n"
                else:
                    if agg_type == 'count':
                        code += f"    results['{name}'] = {class_name}.query.count()\n"
                    else:
                        code += f"    results['{name}'] = db.session.query(func.{agg_type}({class_name}.{field})).scalar() or 0\n"
                
        code += "    return jsonify(results)\n"
        return code

    @staticmethod
    def _generate_crud_routes(features):
        has_auth = GeneratorService._has_auth(features)
        code = "from flask import request, jsonify\nfrom app import db\nfrom app.models import *\nfrom app.routes import api_bp\n"
        if has_auth:
            code += "from flask_jwt_extended import jwt_required, get_jwt_identity\n"
        
        code += "\n@api_bp.route('/', methods=['GET'])\ndef index():\n    return jsonify({'status': 'ok', 'message': 'API is running'})\n\n"

        for feature in features:
            original_name = feature.get('name', 'Unknown')
            f_type = str(feature.get('type') or feature.get('feature_type') or original_name).upper()
            
            if f_type in ['CRUD', 'DATABASE', 'RESOURCE']:
                config = feature.get('config') or feature.get('configuration') or {}
                table_name = config.get('table', original_name.lower())
                class_name = table_name.capitalize()
                slug = table_name
                
                # GET List
                code += f"# Routes for {class_name}\n"
                code += f"@api_bp.route('/{slug}', methods=['GET'])\n"
                if has_auth: code += "@jwt_required()\n"
                code += f"def get_{slug}():\n"
                if has_auth: code += f"    items = {class_name}.query.filter_by(owner_id=get_jwt_identity()).all()\n"
                else: code += f"    items = {class_name}.query.all()\n"
                code += "    return jsonify([item.to_dict() for item in items])\n\n"
                
                # GET Single
                code += f"@api_bp.route('/{slug}/<int:id>', methods=['GET'])\n"
                if has_auth: code += "@jwt_required()\n"
                code += f"def get_{slug}_item(id):\n"
                if has_auth: code += f"    item = {class_name}.query.filter_by(id=id, owner_id=get_jwt_identity()).first_or_404()\n"
                else: code += f"    item = {class_name}.query.get_or_404(id)\n"
                code += "    return jsonify(item.to_dict())\n\n"
                
                # POST
                code += f"@api_bp.route('/{slug}', methods=['POST'])\n"
                if has_auth: code += "@jwt_required()\n"
                code += f"def create_{slug}():\n"
                code += "    data = request.get_json()\n"
                code += f"    new_item = {class_name}()\n"
                if has_auth: code += "    new_item.owner_id = get_jwt_identity()\n"
                
                fields = config.get('fields', [])
                for field in fields:
                    fname = field['name']
                    if fname == 'id': continue
                    if field['type'] == 'datetime': continue
                    code += f"    if '{fname}' in data: new_item.{fname} = data['{fname}']\n"
                
                code += "    db.session.add(new_item)\n    db.session.commit()\n    return jsonify(new_item.to_dict()), 201\n\n"
                
                # DELETE
                code += f"@api_bp.route('/{slug}/<int:id>', methods=['DELETE'])\n"
                if has_auth: code += "@jwt_required()\n"
                code += f"def delete_{slug}(id):\n"
                if has_auth: code += f"    item = {class_name}.query.filter_by(id=id, owner_id=get_jwt_identity()).first_or_404()\n"
                else: code += f"    item = {class_name}.query.get_or_404(id)\n"
                code += "    db.session.delete(item)\n    db.session.commit()\n    return '', 204\n\n"
        return code

    @staticmethod
    def _generate_function_routes(features):
        code = "from flask import request, jsonify\nfrom app import db\nfrom app.routes import api_bp\n\n"
        for feature in features:
            original_name = feature.get('name', 'Unknown')
            f_type = str(feature.get('type') or feature.get('feature_type') or original_name).upper()
            
            if f_type in ['FUNCTIONS', 'FUNCTION', 'CUSTOM_FUNCTION', 'AI ENDPOINTS']:
                config = feature.get('config') or feature.get('configuration') or {}
                fn_name = config.get('name', original_name.lower().replace(' ', '_'))
                fn_code = config.get('code') or config.get('function_code') or "# Placeholder"
                path = config.get('path') or f"/{fn_name}"
                method = config.get('method') or "POST"
                
                code += f"@api_bp.route('{path}', methods=['{method}'])\ndef route_{fn_name}():\n"
                code += "    input_data = request.get_json() if request.is_json else {}\n"
                
                # Indent and add user code
                for line in str(fn_code).split('\n'):
                    code += f"    {line}\n"
                
                code += "\n    # Handle execution results\n"
                code += "    if 'handler' in locals() and callable(locals()['handler']):\n"
                code += "        return jsonify(locals()['handler'](input_data))\n"
                code += "    if 'result' in locals():\n"
                code += "        return jsonify(locals()['result'])\n"
                code += "    return jsonify({'status': 'success'})\n\n"
        return code

    @staticmethod
    def _get_gitignore():
        return """__pycache__/
*.py[cod]
*$py.class
.env
.venv
venv/
ENV/
*.db
*.sqlite3
"""
