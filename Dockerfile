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

# Create default environment variables
RUN echo "PORT=3000\n\
NODE_ENV=production\n\
DB_HOST=postgres\n\
DB_PORT=5432\n\
DB_USERNAME=postgres\n\
DB_PASSWORD=postgres\n\
DB_DATABASE=euphoria\n\
JWT_SECRET=your-jwt-secret-key\n\
JWT_EXPIRATION=24h\n\
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef\n\
DADATA_TOKEN=your-dadata-token\n\
DADATA_URL=https://api.dadata.ru/v2/suggest/party\n\
UPLOAD_DESTINATION=./uploads" > .env

EXPOSE 3000

CMD ["node", "dist/src/main.js"] 