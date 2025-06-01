# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build && ls -la dist/src/

# Production stage
FROM node:20-alpine

# Install wget for health checks
RUN apk add --no-cache wget

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/sequelize ./sequelize

# Verify dist directory contents
RUN ls -la dist/src/

# Create uploads directory
RUN mkdir -p uploads

# Copy environment variables
COPY .env .env

EXPOSE 3000

CMD ["node", "dist/src/main.js"] 