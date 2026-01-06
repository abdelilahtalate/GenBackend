@echo off
SETLOCAL EnableDelayedExpansion

echo ==========================================
echo   Backend Generator Platform Setup Wizard
echo ==========================================
echo.

:: Check Prerequisites
echo Checking prerequisites...

python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.9+.
    pause
    exit /b 1
) else (
    echo [OK] Python found.
)

node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js 18+.
    pause
    exit /b 1
) else (
    echo [OK] Node.js found.
)

docker --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker is not installed. You will need to set up PostgreSQL and Redis manually.
) else (
    echo [OK] Docker found.
)

echo.
echo ==========================================
echo   1. Setting up Backend...
echo ==========================================
cd backend

IF NOT EXIST ".venv" (
    echo Creating Python virtual environment...
    python -m venv .venv
)

echo Activating virtual environment...
call .venv\Scripts\activate

echo Installing backend dependencies...
pip install -r requirements.txt
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)

IF NOT EXIST ".env" (
    echo Creating .env file from example...
    IF EXIST ".env.example" (
        copy .env.example .env
        echo [INFO] Created .env file. Please review it later.
    ) else (
        echo [WARNING] .env.example not found. Creating a basic .env...
        (
            echo FLASK_ENV=development
            echo SECRET_KEY=dev_secret_key
            echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/backend_generator_db
            echo FRONTEND_URL=http://localhost:3000
        ) > .env
    )
)

echo.
echo ==========================================
echo   2. Setting up Frontend...
echo ==========================================
cd ..\frontend

echo Installing frontend dependencies (this may take a while)...
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies.
    pause
    exit /b 1
)

IF NOT EXIST ".env.local" (
    echo Creating .env.local file...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:5000
    ) > .env.local
)

cd ..

echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo To run the project:
echo 1. Start Database/Redis (e.g., 'docker-compose up -d' in backend folder)
echo 2. Start Backend: 'cd backend' then 'python run.py'
echo 3. Start Frontend: 'cd frontend' then 'npm run dev'
echo.
echo Press any key to exit...
pause
