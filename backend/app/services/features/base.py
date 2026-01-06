from abc import ABC, abstractmethod

class FeatureHandler(ABC):
    """Abstract base class for feature handlers"""
    
    @abstractmethod
    def handle(self, method, endpoint, body, schema, context=None):
        """
        Handle the feature test request
        
        Args:
            method (str): HTTP method (GET, POST, PUT, DELETE)
            endpoint (str): The target endpoint path
            body (dict): Request body
            schema (dict): Feature configuration/schema
            
        Returns:
            tuple: (response_data, status_code)
        """
        pass
