# BeanPCGE Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Supabase project (optional, for production auth)
- Domain name (optional, for HTTPS)
- Node.js 18+ (for local development)

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | Generate a strong random string |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3001` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | - |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret for token validation | - |
| `VITE_SUPABASE_URL` | Frontend Supabase URL | `http://localhost:3001` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | - |
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` |
| `DOMAIN` | Production domain | - |

## Deployment Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd pyme-ledger
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

### 3. Build Docker Image

```bash
# Build the image
docker-compose build

# Or build without cache
docker-compose build --no-cache
```

### 4. Start Services

```bash
# Start in production mode
docker-compose up -d

# View logs
docker-compose logs -f beanpcge
```

### 5. Verify Deployment

```bash
# Check health endpoint
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2024-...","version":"1.0.0","environment":"production"}
```

## Post-Deployment Checklist

### Health Check

- [ ] GET `/health` returns 200 OK
- [ ] Database connection is working
- [ ] Static files are served correctly

### Authentication

- [ ] User registration works
- [ ] Login returns valid JWT token
- [ ] Demo mode works
- [ ] Protected routes require authentication

### API Endpoints

- [ ] `GET /api/accounts` returns account list
- [ ] `POST /api/transactions` creates transaction
- [ ] `GET /api/dashboard` returns summary
- [ ] `GET /api/reports/balance` generates balance sheet
- [ ] `GET /api/reports/income` generates income statement

### Monitoring

```bash
# View container logs
docker-compose logs -f beanpcge

# Check container status
docker-compose ps

# Check resource usage
docker stats beanpcge
```

## Backup & Restore

### Backup Database

```bash
docker-compose exec beanpcge cp /app/backend/data/beanpcge.db /tmp/beanpcge.db
docker cp beanpcge:/tmp/beanpcge.db ./backups/
```

### Restore Database

```bash
docker cp ./backups/beanpcge.db beanpcge:/app/backend/data/beanpcge.db
docker-compose restart beanpcge
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs beanpcge

# Common issues:
# - Port 3001 already in use
# - Missing environment variables
# - Database permissions
```

### Database errors

```bash
# Check database file exists
docker-compose exec beanpcge ls -la /app/backend/data/

# Recreate database if needed
docker-compose down -v
docker-compose up -d
```

### CORS issues

Add your domain to CORS configuration in `server.js` or use a reverse proxy.

## Production Optimizations

### Using Dokploy

```yaml
# dokploy.yaml (example)
services:
  beanpcge:
    image: beanpcge:latest
    ports:
      - 3001:3001
    volumes:
      - beanpcge-data:/app/backend/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Using Traefik

The docker-compose.yml includes Traefik labels for automatic HTTPS.

```bash
# Start with Traefik
DOMAIN=your-domain.com docker-compose up -d
```

## Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Enable HTTPS (Traefik with Let's Encrypt)
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up log monitoring
- [ ] Use Supabase for production auth (optional)

## Version Information

- BeanPCGE Version: 1.0.0
- Node.js: 18+
- Database: SQLite 3
- Frontend: React 18 + Vite
