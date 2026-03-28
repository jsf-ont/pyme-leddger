FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

COPY frontend/dist ./frontend/dist

WORKDIR /app

RUN mkdir -p /app/backend/data

COPY backend/server.js ./backend/
COPY backend/routes ./backend/routes
COPY backend/middleware ./backend/middleware

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

USER node

CMD ["dumb-init", "node", "backend/server.js"]
