# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code and scripts
COPY . .

# Build the application
RUN npm run build && ls -la dist/src/

# Production stage
FROM node:20-alpine

# Install wget for health checks and netcat for database check
RUN apk add --no-cache wget netcat-openbsd

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application and scripts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/sequelize ./sequelize
COPY --from=builder /app/scripts/init.sh /app/init.sh

# Make init script executable
RUN chmod +x /app/init.sh

# Verify dist directory contents
RUN ls -la dist/src/

# Create uploads directory
RUN mkdir -p uploads

# Create default environment variables
RUN echo "PORT=3001\n\
NODE_ENV=production\n\
DB_HOST=postgres\n\
DB_PORT=5432\n\
DB_USERNAME=gastro-tour-admin\n\
DB_PASSWORD=pDfhtPZ81203\n\
DB_DATABASE=gastro-tour\n\
REDIS_HOST=redis\n\
REDIS_PORT=6380\n\
REDIS_APPROVE_KEY=b4eb30ba-9c11-436d-82d1-d6b7107d0091\n\
REDIS_TTL=3600\n\
EMAILER_USER=euphoria-mail@mail.ru\n\
EMAILER_PASSWORD=2ms8kwgGjQ1fqvvijZbN\n\
PRIVATE_KEY=secret\n\
SALT_ROUNDS=5\n\
UPLOAD_DESTINATION=./uploads" > .env

EXPOSE 3001

CMD ["/app/init.sh"] 