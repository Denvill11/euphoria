#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "Database is ready!"

# Apply database migrations
echo "Applying database migrations..."
cd /app && npx sequelize-cli db:migrate --config sequelize/config.js --migrations-path sequelize/migrations

# Start the application
echo "Starting the application..."
node dist/main 