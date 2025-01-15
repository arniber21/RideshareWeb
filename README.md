# Avec - University Rideshare Platform

Avec is a modern rideshare platform built specifically for university communities. It enables students and faculty to share rides, reducing transportation costs and environmental impact while building a stronger campus community.

## 🚀 Features

- **Ride Management**
  - Post and search for rides
  - Real-time ride status updates
  - Flexible booking system
  - Seat availability tracking

- **User System**
  - Email and password authentication
  - Google OAuth integration
  - JWT-based session management
  - Profile customization

- **Reviews & Ratings**
  - Rate drivers and passengers
  - Detailed review system
  - Review moderation
  - Anti-spam protection

- **Real-time Communication**
  - WebSocket-based live chat
  - Message persistence
  - Typing indicators
  - Read receipts

- **Payment Integration** (Planned)
  - Stripe Connect integration
  - Payment processing
  - Transaction history

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
  - React 19
  - TypeScript
  - Server Components
- **UI Components**: 
  - Radix UI primitives
  - Tailwind CSS
  - Shadcn/UI components
- **Form Handling**:
  - React Hook Form
  - Zod validation
- **Data Fetching**: 
  - Axios for API calls
  - React Query (planned)

### Backend Services
- **Auth Service**:
  - Express.js
  - JWT authentication
  - Prisma ORM
  - PostgreSQL
- **Rides Service**:
  - Express.js
  - Prisma ORM
  - PostgreSQL
  - RabbitMQ for events
- **Reviews Service**:
  - Express.js
  - Prisma ORM
  - PostgreSQL
- **Chat Service**:
  - Express.js
  - WebSocket
  - Redis for presence
  - PostgreSQL for messages
- **Payment Service** (Planned):
  - Express.js
  - Stripe API
  - PostgreSQL

### Infrastructure
- **Development**:
  - pnpm workspaces
  - Turborepo
  - Docker Compose
- **Deployment**:
  - Docker containers
  - Kubernetes (planned)
  - GitHub Actions CI/CD

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
│   ├── ui/               # Shared UI components
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
- JWT-based authentication
- Google OAuth 2.0 integration
- Password hashing with bcrypt
- Session management with Redis
- Email verification

### Rides Service
- Ride CRUD operations
- Booking management
- Location services
- Event publishing

### Reviews Service
- Review creation and retrieval
- Rating calculations
- Basic moderation
- Report handling

### Chat Service
- WebSocket connections
- Message persistence
- Presence tracking
- Chat history

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 8+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose

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

## 🔒 Environment Configuration

See \`.env.example\` for all required environment variables and their descriptions.

## 📈 Future Enhancements

- Mobile applications (React Native)
- Additional OAuth providers
- Advanced ride matching
- Real-time notifications
- Payment processing
- University SSO integration
- Analytics dashboard

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 