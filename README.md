# BackendGen2 - AI-Powered Backend Generator

BackendGen2 is a sophisticated platform that allows users to generate, test, and export customized backend projects powered by AI. It simplifies the process of creating CRUD APIs, authentication systems, and custom logic functions by leveraging LLMs and a robust generation engine.

## 🚀 Key Features

- **AI-Driven Project Generation**: Define your project requirements and let AI generate the boilerplate, routes, and services.
- **Dynamic Feature Configuration**: Support for CRUD, Authentication, Analytics, and more.
- **Custom Function Implementation**: Write or generate Python functions that integrate seamlessly into your project.
- **Live Preview & Testing**: Test your generated API endpoints in real-time before exporting.
- **Project Export**: Download your completed project as a ready-to-run ZIP file.
- **Synchronization**: Two-way sync between generated files and database configuration.

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask (Python)
- **ORM**: SQLAlchemy (PostgreSQL)
- **Task Queue**: Celery with Redis
- **Security**: JWT (Flask-JWT-Extended), Bcrypt
- **AI Integration**: OpenAI SDK / Custom AI Service
- **Environment**: Python Dotenv for configuration

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **UI Components**: Radix UI, Lucide Icons, Shadcn/UI (Tailwind CSS)
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Hooks
- **Styling**: Tailwind CSS with Framer Motion for animations
- **Testing UI**: Recharts for analytics visualization

## 🏗️ Architecture

The system follows a modern decoupled architecture:

1.  **Frontend (Next.js)**: Provides the user interface for project management, AI wizardry, and live testing. Communicates with the backend via a REST API.
2.  **Backend (Flask)**: Handles business logic, project generation, and database interactions.
3.  **Generator Service**: Core component that translates configurations into Python code using templates and AI logic.
4.  **Database (PostgreSQL)**: Stores project configurations, features, and user metadata.
5.  **Task Queue (Celery/Redis)**: Manages asynchronous tasks like ZIP generation and long-running AI operations.

## 📦 Getting Started

For detailed installation and setup instructions, please refer to the [SETUP.txt](file:///c:/Users/crasy/OneDrive/Bureau/generator/the%20lastt projects/backendGen2/SETUP.txt) file.

### Quick Start (Dev Mode)

1.  **Backend**:
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # or venv\Scripts\activate
    pip install -r requirements.txt
    python run.py
    ```

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 📄 Documentation

- [SETUP.txt](file:///c:/Users/crasy/OneDrive/Bureau/generator/the%20lastt projects/backendGen2/SETUP.txt): Manual setup and configuration guide.
- [ARCHITECTURE.md](file:///c:/Users/crasy/OneDrive/Bureau/generator/the%20lastt projects/backendGen2/ARCHITECTURE.md): Deep dive into system design (if available).
- [QUICK_START.md](file:///c:/Users/crasy/OneDrive/Bureau/generator/the%20lastt projects/backendGen2/QUICK_START.md): Fast tracking for experienced developers.

## 🤝 Contributing

Contributions are welcome! Please follow the contribution guidelines in the repository.

## 📜 License

N/A
