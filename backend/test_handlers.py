import sys
import os
sys.path.append(os.getcwd())

from app import create_app, db
from app.services.features.factory import FeatureHandlerFactory

app = create_app()
with app.app_context():
    factory = FeatureHandlerFactory()
    
    print("--- Testing Auth ---")
    auth = factory.get_handler('AUTH')
    reg_res, status = auth.handle('POST', '/api/auth/register', {'email':'test@example.com', 'password':'pass'}, {})
    print(f"Register Status: {status}")
    print(f"Register Result: {reg_res}")
    
    login_res, status = auth.handle('POST', '/api/auth/login', {'email':'test@example.com', 'password':'pass'}, {})
    print(f"Login Status: {status}")
    print(f"Login Result: {login_res}")
    
    print("\n--- Testing Analytics ---")
    analytics = factory.get_handler('ANALYTICS')
    track_res, status = analytics.handle('POST', '/api/analytics/track', {'event':'page_view'}, {})
    print(f"Track Status: {status}")
    # print(f"Track Result: {track_res}")
    
    stats_res, status = analytics.handle('GET', '/api/analytics/stats', {}, {})
    print(f"Stats Status: {status}")
    print(f"Stats Result: {stats_res}")
