# Multi-stage Dockerfile for Claper

# Stage 1: Build the client frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci --no-audit --no-fund

COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production --no-audit --no-fund

# Copy server code
COPY server/src ./src

# Copy built frontend assets from builder stage
COPY --from=client-builder /app/client/dist /app/client/dist

WORKDIR /app
EXPOSE 4000

CMD ["node", "server/src/index.js"]
