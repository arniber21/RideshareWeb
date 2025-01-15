# Avec - University Rideshare Platform

Avec is a modern rideshare platform built specifically for university communities. It enables students and faculty to share rides, reducing transportation costs and environmental impact while building a stronger campus community.

## 🚀 Features

- **Ride Management**
  - Post and search for rides
  - Real-time ride status updates
  - Flexible booking system
  - Seat availability tracking

- **User System**
  - Secure authentication
  - User profiles with ratings
  - Driver/rider role management
  - Profile customization

- **Reviews & Ratings**
  - Rate drivers and passengers
  - Detailed review system
  - Aggregate ratings
  - Review moderation

- **Real-time Communication**
  - Live chat between users
  - Ride status notifications
  - Booking confirmations

- **Payment Integration** (Planned)
  - Secure payment processing
  - Multiple payment methods
  - Automated refunds
  - Payment history

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **UI Components**:
  - Radix UI (Accessible components)
  - Lucide Icons
  - Sonner (Toast notifications)
  - Date-fns (Date formatting)

### Backend
- **Architecture**: Microservices
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching**: Redis
- **Message Queue**: RabbitMQ

### Infrastructure
- **Package Manager**: pnpm
- **Monorepo Tool**: Turborepo
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **API Gateway**: Express Gateway

## 📦 Project Structure

```
avec/
├── apps/
│   └── web/                 # Next.js web application
├── packages/
│   ├── common/             # Shared types, utilities, constants
│   ├── ui/                 # Shared UI components
│   └── api-client/         # Generated API client
├── services/
│   ├── auth/              # Authentication service
│   ├── rides/             # Ride management service
│   ├── users/             # User service
│   ├── chat/              # Real-time chat service
│   ├── reviews/           # Review service
│   └── payments/          # Payment service (planned)
└── infrastructure/
    ├── terraform/         # Infrastructure as Code
    ├── docker/            # Docker configurations
    └── k8s/               # Kubernetes manifests
```

## 🔧 Services

### Auth Service
- JWT-based authentication
- Role-based access control
- OAuth integration (planned)
- Session management

### Rides Service
- Ride CRUD operations
- Search and filtering
- Booking management
- Route optimization

### Reviews Service
- Review management
- Rating calculations
- Moderation system
- Reporting functionality

### Chat Service
- Real-time messaging
- Message persistence
- Typing indicators
- Read receipts

### Users Service
- Profile management
- Preference settings
- Activity tracking
- Verification system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Redis
- Docker (optional)

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

## 🔒 Environment Variables

Each service requires specific environment variables. Key variables include:

### Web App
\`\`\`env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001
NEXT_PUBLIC_RIDES_API_URL=http://localhost:3002
NEXT_PUBLIC_REVIEWS_API_URL=http://localhost:3003
\`\`\`

### Services
\`\`\`env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/service_name
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
\`\`\`

## 📈 Future Enhancements

- Mobile applications (iOS/Android)
- Advanced route optimization
- AI-powered ride matching
- Social features and groups
- Carbon footprint tracking
- Integration with university systems

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- Arnab Ghosh - Lead Developer

## 📞 Support

For support, please email support@avec-rideshare.com or join our Discord community. 