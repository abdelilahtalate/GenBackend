from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class UserRegisterSchema(BaseModel):
    """User registration schema"""
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    
    @validator('password')
    def password_strong(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserLoginSchema(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str

class ProjectCreateSchema(BaseModel):
    """Project creation schema"""
    name: str
    description: Optional[str] = None
    generation_mode: str = 'manual'  # manual, ai, mixed
    
    @validator('name')
    def name_length(cls, v):
        if len(v) < 3 or len(v) > 255:
            raise ValueError('Project name must be between 3 and 255 characters')
        return v

class FeatureCreateSchema(BaseModel):
    """Feature creation schema"""
    name: str
    feature_type: str
    generation_mode: str = 'manual'
    configuration: Optional[dict] = {}
    schema_definition: Optional[dict] = {}

class FunctionCreateSchema(BaseModel):
    """Custom function creation schema"""
    name: str
    description: Optional[str] = None
    function_code: str
    input_schema: Optional[dict] = {}
    output_schema: Optional[dict] = {}
    endpoint_path: str
    http_method: str = 'POST'
