# Docker Deployment Guide

This guide explains how to deploy the Project Generator using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

1. **Clone the repository** (if you haven't already).
2. **Navigate to the project root**.
3. **Build and start the services**:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## Services Included

- **PostgreSQL**: Database for storing project and user data.
- **Redis**: Message broker for asynchronous tasks.
- **Backend**: Flask-based API service.
- **Frontend**: Next.js-based web interface.

## Configuration

Environment variables can be adjusted in the `docker-compose.yml` file.

### Backend Variables
- `DATABASE_URL`: Connection string for PostgreSQL.
- `REDIS_URL`: Connection string for Redis.
- `FLASK_ENV`: Deployment environment (`production` or `development`).

### Frontend Variables
- `BACKEND_URL`: URL to the backend API (used for rewrites).

## Useful Commands

- **Stop services**: `docker-compose down`
- **View logs**: `docker-compose logs -f`
- **Run migrations**:
  ```bash
  docker-compose exec backend flask db upgrade
  ```

## Development

If you wish to develop with hot-reloading in Docker, you can uncomment the volumes in `docker-compose.yml` and set the environments to `development`.
