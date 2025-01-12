#!/bin/bash

# Array of service directories
services=("auth" "rides" "reviews" "chat" "payments")

# Loop through each service
for service in "${services[@]}"
do
  echo "Creating .env file for $service service..."
  
  # Create .env file with database URL
  cat > "services/$service/.env" << EOL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${service}"
EOL

done

echo "Environment files created!" 