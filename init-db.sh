#!/bin/bash

# Array of service directories
services=("auth" "rides" "reviews" "chat" "payments")

# Loop through each service
for service in "${services[@]}"
do
  echo "Initializing database for $service service..."
  cd "services/$service"
  
  # Push the schema to the database
  pnpm prisma db push
  
  cd ../..
done

echo "Database initialization complete!" 