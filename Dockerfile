# Production Multi-Stage Dockerfile for Ayyappa Bhajan Guide
# Node.js LTS on Alpine Linux for minimal footprint and security

FROM node:20-alpine AS builder

WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Install client dependencies and build frontend
COPY client/package*.json ./client/
RUN npm --prefix client ci

COPY . .
RUN npm --prefix client run build

# Final Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built server and client artifacts
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/client/dist/audio ./client/dist/audio

# Expose production port
EXPOSE 5000

# Start server
CMD ["node", "server/index.js"]
