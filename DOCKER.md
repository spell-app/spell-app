# Docker Setup Documentation

This project uses Docker to containerize the development environment with separate containers for the frontend and backend services.

## Architecture

The project consists of two main services:

- **Frontend Dev Server** (`dev-server`): Runs Vite development server on port 3000
- **Backend Server** (`backend-server`): Runs the Express/TypeScript server on port 3001

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)

## Project Structure

```
├── Dockerfile.dev          # Frontend container configuration (development)
├── Dockerfile.server       # Backend container configuration (development)
├── Dockerfile.prod         # Production container configuration
├── docker-compose.yml      # Multi-container orchestration (development)
├── docker-compose.prod.yml # Production deployment configuration
├── .dockerignore          # Files to exclude from Docker build
└── vite.config.ts         # Vite configuration with host binding
```

## Development Setup

### Quick Start

#### 1. Build and Start Services

```bash
# Build and start both services in background
docker-compose up -d --build

# Or start in foreground (to see logs)
docker-compose up --build
```

#### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Production Setup

### Quick Start

#### 1. Build and Deploy Production

```bash
# Build and start production container
docker-compose -f docker-compose.prod.yml up -d --build

# Or start in foreground
docker-compose -f docker-compose.prod.yml up --build
```

#### 2. Access the Application

- **Application**: http://localhost:3000 (serves both frontend and API)
- **API Endpoint**: http://localhost:3001/api

### Production Features

- **Single Container**: Both frontend and backend in one optimized container
- **Multi-stage Build**: Smaller image size with only production dependencies
- **Security**: Runs as non-root user
- **Health Checks**: Automatic health monitoring
- **Static File Serving**: Built frontend served by Express server
- **SPA Routing**: All routes serve index.html for client-side routing

## Common Commands

### Development Commands

```bash
# Start in background (detached mode)
docker-compose up -d

# Start in foreground (see logs)
docker-compose up

# Start and rebuild images
docker-compose up -d --build

# Start specific service only
docker-compose up -d dev-server
docker-compose up -d backend-server
```

### Production Commands

```bash
# Start production container
docker-compose -f docker-compose.prod.yml up -d --build

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production container
docker-compose -f docker-compose.prod.yml down

# Restart production container
docker-compose -f docker-compose.prod.yml restart
```

### Stopping Services

```bash
# Stop development services
docker-compose down

# Stop production services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes
docker-compose down -v

# Stop and remove images
docker-compose down --rmi all
```

### Monitoring and Logs

```bash
# View logs for all development services
docker-compose logs -f

# View logs for specific development service
docker-compose logs -f dev-server
docker-compose logs -f backend-server

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# View recent logs (last 100 lines)
docker-compose logs --tail=100
```

### Service Management

```bash
# Check development service status
docker-compose ps

# Check production service status
docker-compose -f docker-compose.prod.yml ps

# Restart all development services
docker-compose restart

# Restart production service
docker-compose -f docker-compose.prod.yml restart

# Rebuild specific development service
docker-compose build dev-server
docker-compose build backend-server
```

### Development Workflow

```bash
# 1. Start development services
docker-compose up -d

# 2. Make code changes (files are mounted as volumes)

# 3. View logs to see changes
docker-compose logs -f

# 4. Stop services when done
docker-compose down
```

## Configuration Details

### Development Containers

#### Frontend Container (Dockerfile.dev)

- **Base Image**: Node 20
- **Port**: 3000
- **Command**: `yarn dev --host`
- **Volume Mounts**: 
  - Source code mounted for hot reloading
  - Node modules isolated in container

#### Backend Container (Dockerfile.server)

- **Base Image**: Node 20
- **Port**: 3001
- **Command**: `yarn server`
- **Volume Mounts**:
  - Source code mounted for hot reloading
  - Node modules isolated in container

### Production Container (Dockerfile.prod)

- **Base Image**: Node 20 Alpine (smaller)
- **Multi-stage Build**: Separate build and runtime stages
- **Security**: Non-root user execution
- **Ports**: 3000 (frontend) and 3001 (API)
- **Command**: `yarn server:prod`
- **Features**:
  - Built frontend served by Express
  - Production dependencies only
  - Health checks
  - Signal handling with dumb-init

### Docker Compose Configuration

#### Development (docker-compose.yml)

- **Networking**: Custom bridge network for service communication
- **Environment**: Development mode enabled
- **Port Mapping**: 
  - Host 3000 → Container 3000 (frontend)
  - Host 3001 → Container 3001 (backend)

#### Production (docker-compose.prod.yml)

- **Single Service**: Combined frontend and backend
- **Environment**: Production mode
- **Health Checks**: Automatic monitoring
- **Restart Policy**: Automatic restart on failure
- **Port Mapping**: 
  - Host 3000 → Container 3000 (frontend)
  - Host 3001 → Container 3001 (API)

## Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Stop conflicting services or change ports in docker-compose.yml
```

### Container Won't Start

```bash
# Check container logs
docker-compose logs dev-server
docker-compose logs backend-server

# Check production logs
docker-compose -f docker-compose.prod.yml logs

# Rebuild containers
docker-compose down
docker-compose up --build
```

### Permission Issues

```bash
# If you get permission errors, try:
sudo docker-compose up -d
```

### Clean Up

```bash
# Remove all containers, networks, and images
docker-compose down --rmi all --volumes --remove-orphans

# Clean up production containers
docker-compose -f docker-compose.prod.yml down --rmi all --volumes --remove-orphans

# Clean up Docker system
docker system prune -a
```

## Environment Variables

The following environment variables can be configured:

- `VITE_PORT`: Frontend server port (default: 3000)
- `PORT`: Backend server port (default: 3001)
- `NODE_ENV`: Environment mode (development/production)

## Production Deployment

### Best Practices

1. **Use Production Compose File**: Always use `docker-compose.prod.yml` for production
2. **Environment Variables**: Set production-specific environment variables
3. **Health Monitoring**: Monitor the health check endpoint
4. **Logging**: Configure proper logging for production
5. **Security**: Use secrets management for sensitive data
6. **Scaling**: Use Docker Swarm or Kubernetes for scaling

### Deployment Example

```bash
# Build and deploy to production
docker-compose -f docker-compose.prod.yml up -d --build

# Monitor deployment
docker-compose -f docker-compose.prod.yml logs -f

# Check health
curl http://localhost:3001/hello
```

## File Changes

The following files were created/modified for Docker support:

- `Dockerfile.dev` - Frontend container configuration (development)
- `Dockerfile.server` - Backend container configuration (development)
- `Dockerfile.prod` - Production container configuration
- `docker-compose.yml` - Multi-container orchestration (development)
- `docker-compose.prod.yml` - Production deployment configuration
- `vite.config.ts` - Added host binding and production build configuration
- `src/server/index.ts` - Added production static file serving
- `package.json` - Added production server script
- `.dockerignore` - Excludes unnecessary files from build context 