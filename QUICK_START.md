# Quick Start Guide - BackendGen2

## 🚀 Essential Setup Steps

### 1. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file (copy the content below)
# Create .env file manually or use: copy .env.example .env (if exists)

# Start PostgreSQL and Redis using Docker
docker-compose up -d postgres redis

# Initialize database
python run.py

# Start backend server
python run.py
```

**Backend .env file content:**
```env
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=jwt-secret-key-change-in-production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/backend_generator_db
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Setup (3 minutes)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
# OR
pnpm install

# Create .env.local file (copy the content below)

# Start development server
npm run dev
# OR
pnpm dev
```

**Frontend .env.local file content:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. ⚠️ CRITICAL: Update Frontend API Calls

The frontend currently uses relative paths like `/api/auth/login` which won't work. You need to:

**Option A: Create a Next.js API proxy** (Recommended for development)
- Create `frontend/app/api/auth/login/route.ts` that proxies to backend

**Option B: Update all fetch calls** to use the environment variable:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${API_URL}/api/auth/login`, { ... });
```

**Files that need updating:**
- `frontend/app/login/page.tsx`
- `frontend/app/signup/page.tsx`
- `frontend/components/wizard/step5-testing.tsx`
- `frontend/components/wizard/step4-configuration.tsx`
- Any other files making API calls

### 4. Verify Setup

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"ok"}`

2. **Test Registration:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User"}'
   ```

3. **Open Frontend:**
   - Navigate to `http://localhost:3000`
   - Check browser console for errors

---

## 📋 Missing Dependencies

### Backend
- `pydantic` version is missing in `requirements.txt` - add `pydantic==2.0.0` or latest version

### Frontend
- All dependencies appear to be in `package.json`

---

## 🔧 Common Issues

### Issue: "psycopg2 installation fails"
**Solution:** Use Docker for PostgreSQL instead:
```bash
docker-compose up -d postgres
```

### Issue: "Redis connection error"
**Solution:** Start Redis:
```bash
docker-compose up -d redis
```

### Issue: "CORS errors in browser"
**Solution:** 
1. Check `FRONTEND_URL` in backend `.env` matches `http://localhost:3000`
2. Ensure backend is running
3. Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Issue: "Database tables don't exist"
**Solution:**
```bash
cd backend
python run.py  # This creates tables
```

---

## 📁 Project Structure

```
backendGen2/
├── backend/
│   ├── app/              # Flask application
│   ├── config/           # Configuration
│   ├── requirements.txt  # Python dependencies
│   ├── docker-compose.yml
│   └── .env             # Backend environment variables (CREATE THIS)
│
└── frontend/
    ├── app/             # Next.js pages
    ├── components/      # React components
    ├── package.json     # Node dependencies
    └── .env.local       # Frontend environment variables (CREATE THIS)
```

---

## ✅ Checklist

- [ ] Python 3.9+ installed
- [ ] Node.js 18+ installed
- [ ] Docker installed (for PostgreSQL/Redis)
- [ ] Backend `.env` file created
- [ ] Frontend `.env.local` file created
- [ ] PostgreSQL running (via Docker or local)
- [ ] Redis running (via Docker or local)
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Database initialized (`python run.py`)
- [ ] Backend server running (`python run.py`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Frontend API calls updated to use backend URL
- [ ] Test registration/login works

---

## 🎯 Next Steps After Setup

1. **Fix Frontend API Integration** - Update all API calls to point to backend
2. **Set up Celery Worker** (if using background tasks):
   ```bash
   cd backend
   celery -A app.celery worker --loglevel=info
   ```
3. **Add AI API Key** (if using AI features) - Add to backend `.env`
4. **Create uploads directory**:
   ```bash
   cd backend
   mkdir uploads
   ```

---

## 📚 Full Documentation

See `SETUP_GUIDE.md` for detailed documentation.

