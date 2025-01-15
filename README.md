# Avec - University Rideshare Platform

Avec is a modern rideshare platform built specifically for university communities. It enables students and faculty to share rides, reducing transportation costs and environmental impact while building a stronger campus community.

## 🚀 Features

- **Ride Management**
  - Post and search for rides
  - Real-time ride status updates
  - Flexible booking system
  - Seat availability tracking
  - Route optimization and matching

- **User System**
  - Multi-factor authentication
  - OAuth 2.0 integration (Google, Microsoft)
  - Role-based access control (RBAC)
  - JWT-based session management
  - Refresh token rotation
  - Profile customization

- **Reviews & Ratings**
  - Rate drivers and passengers
  - Detailed review system
  - Aggregate ratings with weighted algorithms
  - Review moderation with AI content filtering
  - Anti-spam protection

- **Real-time Communication**
  - WebSocket-based live chat
  - Server-Sent Events for notifications
  - Message persistence with Redis
  - Typing indicators
  - Read receipts

- **Payment Integration** (Planned)
  - Stripe Connect integration
  - Multi-currency support
  - Automated refunds and disputes
  - Payment escrow system
  - Transaction history

## 🛠 Tech Stack

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
  - Server Components for improved performance
  - React Server Actions for form handling
  - Streaming and Suspense for progressive loading
- **State Management**: 
  - React Context for global state
  - SWR for data fetching and caching
  - Optimistic updates for better UX
- **Styling**: 
  - Tailwind CSS with custom configuration
  - Radix UI primitives for accessibility
  - CSS Modules for component-specific styles
- **Performance**:
  - Dynamic imports for code splitting
  - Image optimization with next/image
  - Edge runtime for API routes
  - Incremental Static Regeneration

### Backend Architecture
- **Microservices**:
  - Event-driven architecture
  - Service discovery via Consul
  - Circuit breakers with Hystrix
  - Load balancing with NGINX
- **API Design**:
  - RESTful endpoints with OpenAPI specs
  - GraphQL gateway for complex queries
  - WebSocket for real-time features
  - Rate limiting and throttling
- **Data Layer**:
  - PostgreSQL with read replicas
  - Redis for caching and sessions
  - RabbitMQ for event bus
  - Prisma for type-safe queries
- **Security**:
  - OAuth 2.0 / OpenID Connect
  - JWT with RSA signatures
  - CORS with specific origins
  - XSS/CSRF protection
  - Rate limiting per IP/user

### Infrastructure
- **Container Orchestration**:
  - Kubernetes with custom operators
  - Helm charts for deployment
  - Istio service mesh
  - Prometheus monitoring
- **CI/CD**:
  - GitHub Actions workflows
  - Automated testing
  - Semantic versioning
  - Blue-green deployments
- **Monitoring**:
  - ELK stack for logging
  - Prometheus metrics
  - Grafana dashboards
  - Error tracking with Sentry

## 📦 Project Structure

\`\`\`
avec/
├── apps/
│   └── web/                 # Next.js web application
│       ├── app/            # App router pages
│       ├── components/     # React components
│       ├── lib/           # Utilities and hooks
│       └── styles/        # Global styles
├── packages/
│   ├── common/            # Shared code
│   │   ├── types/        # TypeScript definitions
│   │   ├── utils/        # Shared utilities
│   │   └── constants/    # Shared constants
│   ├── ui/               # Component library
│   │   ├── atoms/        # Basic components
│   │   ├── molecules/    # Composite components
│   │   └── organisms/    # Complex components
│   └── api-client/       # Generated API client
├── services/
│   ├── auth/             # Authentication service
│   │   ├── src/
│   │   ├── prisma/      # Database schema
│   │   └── tests/       # Service tests
│   ├── rides/           # Ride management
│   ├── users/           # User management
│   ├── chat/            # Real-time chat
│   ├── reviews/         # Review system
│   └── payments/        # Payment processing
└── infrastructure/
    ├── terraform/       # IaC definitions
    ├── docker/          # Container configs
    └── k8s/             # K8s manifests
\`\`\`

## 🔧 Service Architecture

### Auth Service
- **OAuth 2.0 Flow**:
  - Authorization Code with PKCE
  - Refresh token rotation
  - JWT signing with RS256
  - Token revocation endpoint
- **Security Features**:
  - Password hashing with Argon2
  - Rate limiting on auth endpoints
  - IP-based blocking
  - Audit logging
- **Session Management**:
  - Redis session store
  - Secure cookie handling
  - Device fingerprinting
  - Concurrent session control

### Rides Service
- **Core Features**:
  - Geospatial search with PostGIS
  - Real-time availability updates
  - Booking state machine
  - Conflict resolution
- **Integration Points**:
  - Event publishing to RabbitMQ
  - User service for profiles
  - Payment service for transactions
  - Notification service for alerts

### Reviews Service
- **Features**:
  - Weighted rating algorithms
  - Spam detection
  - Content moderation
  - Report handling
- **Data Model**:
  - Hierarchical review structure
  - Metadata storage
  - Audit trail
  - Soft deletion

### Chat Service
- **WebSocket Implementation**:
  - Connection pooling
  - Room management
  - Message queuing
  - Presence tracking
- **Storage**:
  - Message persistence
  - Read receipts
  - User presence
  - Chat history

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose
- Kubernetes (optional)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/arniber21/RideshareWeb.git
cd RideshareWeb
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Initialize databases:
\`\`\`bash
pnpm db:push
\`\`\`

5. Start the development server:
\`\`\`bash
pnpm dev
\`\`\`

### Development Scripts

- \`pnpm dev\`: Start all services in development mode
- \`pnpm build\`: Build all packages and applications
- \`pnpm test\`: Run tests across the monorepo
- \`pnpm lint\`: Run linting across the monorepo
- \`pnpm db:push\`: Push database schema changes
- \`pnpm db:generate\`: Generate Prisma client

## 🔒 Security Configuration

### OAuth 2.0 Setup
\`\`\`env
# OAuth 2.0 Configuration
OAUTH_GOOGLE_CLIENT_ID=your-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-client-secret
OAUTH_GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/callback/google

OAUTH_MICROSOFT_CLIENT_ID=your-client-id
OAUTH_MICROSOFT_CLIENT_SECRET=your-client-secret
OAUTH_MICROSOFT_CALLBACK_URL=http://localhost:3000/api/auth/callback/microsoft

# JWT Configuration
JWT_PRIVATE_KEY=path/to/private.key
JWT_PUBLIC_KEY=path/to/public.key
JWT_ALGORITHM=RS256
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Security Headers
SECURITY_CORS_ORIGINS=http://localhost:3000,https://avec.example.com
SECURITY_RATE_LIMIT_WINDOW=15m
SECURITY_RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

### Service Environment Variables
\`\`\`env
# Web App
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001
NEXT_PUBLIC_RIDES_API_URL=http://localhost:3002
NEXT_PUBLIC_REVIEWS_API_URL=http://localhost:3003
NEXT_PUBLIC_CHAT_API_URL=http://localhost:3004

# Microservices
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/service_name
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
\`\`\`

## 📈 Future Enhancements

- Mobile applications (React Native)
- Advanced route optimization with ML
- AI-powered ride matching
- Blockchain-based reputation system
- Real-time analytics dashboard
- University SSO integration
- Carbon footprint tracking
- Social features and groups

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 