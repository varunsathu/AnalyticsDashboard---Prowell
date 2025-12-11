# Analytics Dashboard - Architecture Overview

## Languages & Technologies

**Frontend**: React 18 with TypeScript, Vite build tool, Tailwind CSS for styling, and Shadcn/ui component library. State management handled by TanStack Query for server state and React hooks for local state.

**Backend**: Node.js with Express.js framework, TypeScript throughout, and Passport.js for authentication using OpenID Connect.

**Database**: PostgreSQL with Drizzle ORM for type-safe database operations, hosted on Neon's serverless platform.

**Development**: Full-stack TypeScript monolith with shared types, Vite for frontend development, and esbuild for backend bundling.

---

## Architecture Overview

This project follows a **Client-Server Monolithic Architecture** with a **Database-First Design**. The system is organized into distinct layers:

**Presentation Layer**: React frontend with component-based architecture, using Wouter for routing and modular UI components for tasks, notes, analytics, and focus features.

**Application Layer**: Express.js backend handling HTTP requests, API routes, authentication middleware, and business logic. Uses Zod for validation and rate limiting for security.

**Data Access Layer**: Drizzle ORM providing type-safe database operations with PostgreSQL, including session storage and user data management.

**Infrastructure Layer**: Neon Database for cloud hosting, Replit platform for development/deployment, and environment-based configuration management.

The data flow follows a **Request-Response Pattern**: User actions trigger React components → TanStack Query makes API calls → Express routes process requests → Drizzle ORM executes database operations → Responses flow back through the same path.

**Security Architecture** implements multiple layers: client-side AES-256 encryption for sensitive data, HTTPS transport security, server-side rate limiting and input sanitization, and session-based authentication with CSRF protection.

**State Management** uses a hybrid approach: TanStack Query for server state with caching, React hooks for local component state, and database-backed sessions for user authentication.

The application features a **modular design** with separate components for task management, smart notes, focus timers, analytics dashboard, and journaling system. Each module operates independently while sharing common data through the centralized database.

**Development Workflow** supports hot reloading with Vite, type safety across the entire stack, and environment-specific configurations for local development versus production deployment.

This architecture prioritizes **developer experience**, **type safety**, and **user privacy** while maintaining simplicity for deployment and maintenance.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (local or cloud)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   NODE_ENV=development
   SESSION_SECRET="your-session-secret"
   ```

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## Project Structure

```
AnalyticsDashboard/
├── client/          # Frontend React application
├── server/          # Backend Express application
├── shared/          # Shared TypeScript types and schemas
└── package.json     # Project dependencies
```

For more detailed information, see [replit.md](./replit.md).

