from .crud import CRUDHandler
from .function import FunctionHandler
from .auth import AuthHandler
from .analytics import AnalyticsHandler
from .base import FeatureHandler

class DefaultHandler(FeatureHandler):
    """Default handler for unknown feature types"""
    def handle(self, method, endpoint, body, schema):
        return {
            'status': 400, 
            'error': 'Unsupported feature type',
            'message': 'No handler found for this feature type'
        }, 400

class FeatureHandlerFactory:
    """Factory to get the correct feature handler"""
    
    _handlers = {
        'CRUD': CRUDHandler(),
        'FUNCTIONS': FunctionHandler(),
        'AUTH': AuthHandler(),
        'ANALYTICS': AnalyticsHandler(),
    }
    
    _default_handler = DefaultHandler()
    
    @classmethod
    def get_handler(cls, feature_type):
        """Get handler by feature type name"""
        # Simple normalization
        key = feature_type
        
        # Try to find exact match or case-insensitive match
        for k, v in cls._handlers.items():
            if k.lower() == str(key).lower():
                return v
                
        # Default to CRUD if it looks like a resource test, or use specific logic
        # For now, strict matching with CRUD as fallback if needed, or Default
        if not key or key == 'mixed' or key == 'manual':
             # Often 'manual' features in this context are CRUD-like
             return cls._handlers.get('CRUD')
             
        return cls._default_handler
