# Backend Generator Platform - Backend API

A production-ready Python Flask backend for the SaaS Backend Generator Platform. This backend supports manual, AI-assisted, and mixed feature generation modes.

## Features

- **Authentication**: JWT-based auth with role-based access control (RBAC)
- **Project Management**: Create and manage backend projects
- **Dynamic CRUD**: Generate tables and CRUD endpoints from schemas
- **Custom Functions**: Create and test custom business logic
- **Analytics**: Aggregation endpoints for data analysis
- **File Management**: Upload, store, and manage files
- **Background Jobs**: Queue and execute background tasks
- **AI Integration**: Sandboxed AI endpoint for code/config generation
- **Full Testing**: Pytest coverage for all endpoints

## Tech Stack

- **Language**: Python 3.9+
- **Framework**: Flask 3.0
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (Flask-JWT-Extended)
- **Task Queue**: Celery + Redis
- **Testing**: Pytest

## Installation

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- Redis (for Celery)

### Setup

1. **Clone and install dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Initialize database**:
```bash
python run.py
```

4. **Run the server**:
```bash
python run.py
```

Server runs at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List user projects
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Features
- `POST /api/features` - Create feature
- `GET /api/features/project/{project_id}` - Get project features
- `PUT /api/features/{id}` - Update feature
- `DELETE /api/features/{id}` - Delete feature

### Custom Functions
- `POST /api/functions` - Create function
- `GET /api/functions/project/{project_id}` - Get project functions
- `POST /api/functions/{id}/test` - Test function execution

### Analytics
- `POST /api/analytics/aggregate` - Calculate aggregates
- `GET /api/analytics/statistics/{table_name}` - Get table statistics

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/{id}` - Get file metadata
- `DELETE /api/files/{id}` - Delete file

### Background Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task status
- `POST /api/tasks/{id}/cancel` - Cancel task

### AI Endpoints
- `POST /api/ai/generate-config` - Generate config with AI
- `POST /api/ai/generate-code` - Generate code with AI
- `POST /api/ai/sandbox-execute` - Execute code in sandbox

## Code Generation Modes

All features support three generation modes:

1. **Manual**: User writes all code/configuration manually
2. **AI-Assisted**: AI generates suggestions and code
3. **Mixed**: User provides base config, AI enhances it

## Testing

Run all tests:
```bash
pytest
```

Run specific test file:
```bash
pytest tests/test_auth.py
```

Run with coverage:
```bash
pytest --cov=app
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation with Pydantic
- ✅ Sandboxed code execution
- ✅ CORS configuration
- ✅ SQL injection prevention
- ✅ File upload restrictions

## Database Schema

### Users
- id, email, password_hash, first_name, last_name, role_id, is_active, created_at, updated_at

### Projects
- id, name, description, owner_id, status, generation_mode, api_key, created_at, updated_at

### Features
- id, project_id, name, feature_type, generation_mode, configuration, schema_definition, is_enabled, created_at, updated_at

### Custom Functions
- id, project_id, name, description, function_code, input_schema, output_schema, generation_mode, endpoint_path, http_method, is_active, created_at, updated_at

### Files
- id, project_id, uploader_id, filename, original_filename, file_path, file_size, file_type, created_at

### Background Tasks
- id, project_id, task_type, task_name, status, payload, result, error_message, scheduled_for, created_at, started_at, completed_at

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret for JWT token signing
- `AI_API_KEY`: API key for AI service
- `REDIS_URL`: Redis connection string
- `FRONTEND_URL`: CORS frontend URL

## Development

### Adding New Endpoints

1. Create service in `app/services/`
2. Add route in `app/routes/`
3. Add validator in `app/utils/validators.py`
4. Add tests in `tests/`

### Running Locally with Docker

```bash
docker-compose up
```

## Production Deployment

1. Set `FLASK_ENV=production`
2. Update `SECRET_KEY` and `JWT_SECRET_KEY`
3. Use production database connection
4. Enable HTTPS
5. Set up proper logging and monitoring
6. Use Gunicorn or similar WSGI server

## Contributing

Follow PEP 8 style guide and include tests for new features.

## License

MIT
