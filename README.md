# Backend Generator Platform

A powerful, production-ready SaaS platform for generating backend applications. This project features a modern Next.js frontend and a robust Flask backend, capable of generating, managing, and deploying backend projects with manual, AI-assisted, or mixed modes.

## 🚀 Technologies

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Directory)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) / shadcn/ui
- **State Management**: React Hooks & Context
- **Form Handling**: React Hook Form + Zod
- **Visualizations**: Recharts
- **Icons**: Lucide React

### Backend
- **Framework**: [Flask 3.0](https://flask.palletsprojects.com/)
- **Language**: Python 3.9+
- **Database**: [PostgreSQL 12+](https://www.postgresql.org/)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Authentication**: JWT (Flask-JWT-Extended)
- **Task Queue**: Celery + Redis
- **Validation**: Pydantic
- **Testing**: Pytest

### Infrastructure & Tools
- **Containerization**: Docker & Docker Compose
- **Version Control**: Git

## 🏗️ Architecture & utilization

### API Communication
The frontend and backend communicate via a **RESTful API**.
1. **Request**: The frontend sends HTTP requests (GET, POST, PUT, DELETE) to the backend API endpoints (e.g., `http://localhost:5000/api/...`).
2. **Authentication**: Protected endpoints require a valid **JWT (JSON Web Token)** in the `Authorization` header (`Bearer <token>`).
3. **Data Format**: Data is exchanged in **JSON** format.
4. **CORS**: Cross-Origin Resource Sharing is configured to allow the frontend to safely communicate with the backend.

### Key Components
1. **User Authentication**: Secure registration and login flow with token-based session management.
2. **Project Management**: CRUD operations for projects, including configuration for features and environment variables.
3. **Code Generation Engine**: A sophisticated engine (potentially AI-enhanced) that takes project configurations and generates downloadable backend codebases.
4. **Dashboard**: A comprehensive UI for visualizing project statistics, status, and recent activities.

## ⚡ Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose (recommended for Database/Redis)

### Automatic Setup (Windows)
Run the included setup script to automate installation:
```cmd
setup.bat
```

### Manual Setup

#### 1. Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Configure your database credentials
python run.py         # Initializes DB and starts server
```

#### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # Configure NEXT_PUBLIC_API_URL
npm run dev
```

## 📚 Documentation
For a detailed step-by-step guide, troubleshooting, and advanced configuration, please refer to:
- [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- [QUICK_START.md](./QUICK_START.md)

## 📄 License
This project is licensed under the MIT License.
