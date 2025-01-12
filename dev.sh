#!/bin/bash

# Kill any existing processes on the ports we'll use
kill_port() {
    lsof -ti tcp:$1 | xargs kill -9 2>/dev/null
}

kill_port 3000  # Frontend
kill_port 3001  # Auth Service
kill_port 3002  # Rides Service
kill_port 3003  # Reviews Service
kill_port 3004  # Payments Service
kill_port 3005  # Chat Service

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "Starting PostgreSQL..."
    brew services start postgresql@14
    sleep 2  # Wait for PostgreSQL to start
fi

# Create databases if they don't exist
create_database() {
    local db_name=$1
    if ! psql -lqt | cut -d \| -f 1 | grep -qw $db_name; then
        echo "Creating database: $db_name"
        createdb $db_name
    fi
}

create_database "avec_auth"
create_database "avec_rides"
create_database "avec_reviews"
create_database "avec_payments"
create_database "avec_chat"

# Function to start a service
start_service() {
    local service=$1
    local port=$2
    cd "services/$service" || exit
    
    # Check if .env exists, if not copy from example
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
        fi
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies for $service..."
        pnpm install
    fi
    
    # Run database migrations if they exist
    if [ -d "prisma" ]; then
        echo "Running database sync for $service..."
        pnpm prisma db push
    fi
    
    echo "Starting $service on port $port..."
    PORT=$port pnpm dev &
    cd ../..
}

# Start all backend services
start_service "auth" 3001
start_service "rides" 3002
start_service "reviews" 3003
start_service "payments" 3004
start_service "chat" 3005

# Start the frontend
cd apps/web || exit
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    pnpm install
fi
echo "Starting frontend on port 3000..."
pnpm dev 