# Complete Setup Guide for BackendGen2

This guide will help you set up both the backend and frontend to work correctly.

## Project Overview

- **Backend**: Flask (Python) API with PostgreSQL, Redis, and Celery
- **Frontend**: Next.js (React/TypeScript) application

---

## Prerequisites

### Required Software
1. **Python 3.9+** - For backend
2. **Node.js 18+** - For frontend
3. **PostgreSQL 12+** - Database
4. **Redis** - For Celery task queue
5. **Docker & Docker Compose** (Optional but recommended)

### Optional
- **Git** - Version control
- **Postman/Insomnia** - API testing

---

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note**: On Windows, you may need to install PostgreSQL development libraries for `psycopg2-binary`. If you encounter issues, consider using Docker.

### 2. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
# Create .env file
```

Add the following content to `backend/.env`:

```env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES=3600

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/backend_generator_db

# Redis Configuration (for Celery)
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# AI Configuration (Optional - for AI features)
AI_API_KEY=your-ai-api-key-here
AI_SANDBOX_ENABLED=True

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_FOLDER=./uploads
ALLOWED_EXTENSIONS=pdf,txt,csv,json,xlsx

# SQLAlchemy (Optional)
SQLALCHEMY_ECHO=False
```

### 3. Set Up PostgreSQL Database

#### Option A: Using Docker Compose (Recommended)

```bash
cd backend
docker-compose up -d postgres redis
```

This will start PostgreSQL and Redis containers.

#### Option B: Manual PostgreSQL Setup

1. Install PostgreSQL on your system
2. Create a database:
```sql
CREATE DATABASE backend_generator_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE backend_generator_db TO postgres;
```

3. Install and start Redis:
   - **Windows**: Download from https://redis.io/download or use WSL
   - **Mac**: `brew install redis && brew services start redis`
   - **Linux**: `sudo apt-get install redis-server && sudo systemctl start redis`

### 4. Initialize Database

```bash
cd backend
python run.py
```

This will create all database tables. Alternatively, if you have Flask-Migrate set up:

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 5. Run Backend Server

```bash
cd backend
python run.py
```

The backend will run on `http://localhost:5000`

### 6. Verify Backend is Running

```bash
curl http://localhost:5000/health
```

Should return: `{"status":"ok"}`

---

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd frontend
npm install
```

Or if you prefer using pnpm (which is already in the project):
```bash
cd frontend
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
cd frontend
# Create .env.local file
```

Add the following content to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Update Frontend API Calls

The frontend currently uses relative API paths (e.g., `/api/auth/login`). You need to either:

#### Option A: Use Next.js API Routes as Proxy (Recommended for development)

Create API route files in `frontend/app/api/` that proxy to the backend.

#### Option B: Update Frontend to Use Backend URL Directly

Update all fetch calls in the frontend to use the `NEXT_PUBLIC_API_URL` environment variable.

**Example**: In `frontend/app/login/page.tsx`, change:
```typescript
const response = await fetch("/api/auth/login", {
```

To:
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
```

### 4. Run Frontend Development Server

```bash
cd frontend
npm run dev
```

Or:
```bash
pnpm dev
```

The frontend will run on `http://localhost:3000`

---

## Running with Docker (Alternative)

### Start All Services

```bash
cd backend
docker-compose up
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend on port 5000

Then run the frontend separately:
```bash
cd frontend
npm run dev
```

---

## Common Setup Issues & Solutions

### 1. PostgreSQL Connection Error

**Error**: `psycopg2.OperationalError: could not connect to server`

**Solutions**:
- Ensure PostgreSQL is running: `docker-compose up -d postgres` or start PostgreSQL service
- Check DATABASE_URL in `.env` matches your PostgreSQL credentials
- Verify PostgreSQL is listening on port 5432

### 2. Redis Connection Error

**Error**: `redis.exceptions.ConnectionError`

**Solutions**:
- Start Redis: `docker-compose up -d redis` or start Redis service
- Check REDIS_URL in `.env` is correct
- Verify Redis is running: `redis-cli ping` (should return PONG)

### 3. Frontend Can't Connect to Backend

**Error**: CORS errors or network errors

**Solutions**:
- Ensure backend is running on port 5000
- Check `FRONTEND_URL` in backend `.env` matches frontend URL
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local` is correct
- Check browser console for specific error messages

### 4. Module Not Found Errors

**Backend**:
```bash
cd backend
pip install -r requirements.txt
```

**Frontend**:
```bash
cd frontend
npm install
# or
pnpm install
```

### 5. Database Migration Issues

If tables don't exist:
```bash
cd backend
python run.py  # This creates tables automatically
```

Or use Flask-Migrate:
```bash
flask db upgrade
```

---

## Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:5000/health
```

### 2. Test Backend Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 3. Test Backend Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### 4. Test Frontend

1. Open `http://localhost:3000` in your browser
2. Try to register a new account
3. Try to login
4. Check browser console for any errors

---

## Development Workflow

### Backend Development

1. Make changes to backend code
2. Backend auto-reloads (if using `python run.py` with debug=True)
3. Test endpoints using Postman or curl

### Frontend Development

1. Make changes to frontend code
2. Frontend auto-reloads (Next.js hot reload)
3. Check browser for changes

### Database Changes

If you modify models:
```bash
cd backend
flask db migrate -m "Description of changes"
flask db upgrade
```

---

## Production Deployment

### Backend

1. Set `FLASK_ENV=production` in `.env`
2. Use a production WSGI server (Gunicorn):
   ```bash
   gunicorn --bind 0.0.0.0:5000 run:app
   ```
3. Use strong `SECRET_KEY` and `JWT_SECRET_KEY`
4. Set up proper database (not localhost)
5. Configure HTTPS
6. Set up proper logging and monitoring

### Frontend

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Start production server:
   ```bash
   npm run start
   ```
3. Or deploy to Vercel/Netlify

---

## Next Steps

1. ✅ Set up backend environment variables
2. ✅ Set up frontend environment variables
3. ✅ Start PostgreSQL and Redis
4. ✅ Initialize database
5. ✅ Start backend server
6. ✅ Start frontend server
7. ✅ Test registration and login
8. ⚠️ Update frontend API calls to use backend URL
9. ⚠️ Set up Celery worker (if using background tasks)
10. ⚠️ Configure AI API key (if using AI features)

---

## Additional Notes

- The backend uses Flask-Migrate for database migrations
- Celery is configured but you'll need to run a Celery worker separately for background tasks
- File uploads are stored in `backend/uploads` directory (create it if needed)
- The frontend uses Tailwind CSS v4 with PostCSS
- TypeScript is configured but build errors are ignored (see `next.config.mjs`)

---

## Support

If you encounter issues:
1. Check the error messages in console/logs
2. Verify all environment variables are set correctly
3. Ensure all services (PostgreSQL, Redis) are running
4. Check network connectivity between frontend and backend
5. Review the Common Setup Issues section above

