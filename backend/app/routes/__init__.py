from app.routes.auth import auth_bp
from app.routes.projects import projects_bp
from app.routes.features import features_bp
from app.routes.functions import functions_bp
from app.routes.analytics import analytics_bp
from app.routes.files import files_bp
from app.routes.tasks import tasks_bp
from app.routes.ai import ai_bp

__all__ = ['auth_bp', 'projects_bp', 'features_bp', 'functions_bp', 'analytics_bp', 'files_bp', 'tasks_bp', 'ai_bp']
