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

# Create init script with proper line endings
RUN echo '#!/bin/sh' > /app/init.sh && \
    echo '' >> /app/init.sh && \
    echo '# Wait for database to be ready' >> /app/init.sh && \
    echo 'echo "Waiting for database to be ready..."' >> /app/init.sh && \
    echo 'while ! nc -z $DB_HOST $DB_PORT; do' >> /app/init.sh && \
    echo '  sleep 1' >> /app/init.sh && \
    echo 'done' >> /app/init.sh && \
    echo 'echo "Database is ready!"' >> /app/init.sh && \
    echo '' >> /app/init.sh && \
    echo '# Apply database migrations' >> /app/init.sh && \
    echo 'echo "Applying database migrations..."' >> /app/init.sh && \
    echo 'cd /app && npx sequelize-cli db:migrate --config sequelize/config.js --migrations-path sequelize/migrations' >> /app/init.sh && \
    echo '' >> /app/init.sh && \
    echo '# Start the application' >> /app/init.sh && \
    echo 'echo "Starting the application..."' >> /app/init.sh && \
    echo 'exec node /app/dist/src/main.js' >> /app/init.sh && \
    chmod +x /app/init.sh && \
    cat /app/init.sh

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

# Use shell form to ensure proper script execution
CMD /bin/sh /app/init.sh 