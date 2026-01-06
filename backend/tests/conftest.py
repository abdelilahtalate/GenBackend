import pytest
from app import create_app, db
from app.models import Role

@pytest.fixture
def app():
    """Create and configure test app"""
    app = create_app('testing')
    
    with app.app_context():
        db.create_all()
        
        # Create test roles
        admin_role = Role(name='admin', description='Administrator')
        user_role = Role(name='user', description='Regular user')
        db.session.add(admin_role)
        db.session.add(user_role)
        db.session.commit()
        
        yield app
        
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Test client"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """CLI runner"""
    return app.test_cli_runner()
