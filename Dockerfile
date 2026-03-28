# ===========================================
# Stage 1: Build Frontend
# ===========================================
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ===========================================
# Stage 2: Production
# ===========================================
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl

COPY --from=builder /app/frontend/dist ./frontend/dist

COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

WORKDIR /app
RUN mkdir -p /app/backend/data

COPY backend/server.js ./backend/
COPY backend/routes ./backend/routes
COPY backend/middleware ./backend/middleware
COPY backend/migrations ./backend/migrations

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["dumb-init", "node", "backend/server.js"]
