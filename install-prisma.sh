#!/bin/bash

# Array of service directories
services=("auth" "rides" "reviews" "chat" "payments")

# Loop through each service
for service in "${services[@]}"
do
  echo "Installing Prisma dependencies in $service service..."
  cd "services/$service"
  
  # Install dependencies
  pnpm add -D prisma
  pnpm add @prisma/client
  
  # Create prisma directory if it doesn't exist
  mkdir -p prisma
  
  # Generate Prisma client
  pnpm prisma generate
  
  cd ../..
done

echo "Prisma installation complete!" 