# TaskSync AI - AI-Powered Productivity Management Platform

## Overview

TaskSync AI is a comprehensive productivity management application that combines intelligent task management, calendar synchronization, and AI-powered optimization to help users maximize their daily efficiency. The system integrates with multiple calendar providers and uses OpenAI to provide personalized scheduling recommendations and productivity insights.

## System Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite build system
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **AI Integration**: OpenAI GPT-4o for intelligent planning and suggestions
- **Calendar Integration**: Google Calendar API
- **State Management**: TanStack Query for server state management
- **Session Storage**: PostgreSQL-based session store

### Architecture Pattern
The application follows a full-stack monorepo architecture with clear separation between client, server, and shared code. The frontend uses a component-based architecture with React hooks for state management, while the backend implements a RESTful API with Express.js middleware for authentication and request handling.

## Key Components

### Frontend Architecture
- **Component Structure**: Modular UI components using shadcn/ui design system
- **Routing**: File-based routing with wouter library (Dashboard, Settings pages)
- **State Management**: TanStack Query for server state, React hooks for local state
- **Authentication**: Integrated Replit Auth with automatic redirects for unauthenticated users
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Calendar Integration UI**: Dedicated settings page with provider connection management

### Backend Architecture
- **API Layer**: RESTful endpoints for tasks, calendar events, AI plans, and calendar integrations
- **Authentication Middleware**: Replit Auth integration with session management
- **Database Layer**: Drizzle ORM with type-safe schema definitions
- **Service Layer**: OpenAI integration, Google Calendar API, and Outlook Calendar API
- **OAuth Integration**: Complete OAuth 2.0 flows for Google and Microsoft services

### Database Schema
- **Users**: User profiles with Replit Auth integration
- **Tasks**: Task management with categories, priorities, and completion tracking
- **Calendar Events**: Multi-source calendar event storage with external ID mapping
- **Calendar Integrations**: OAuth token storage for connected calendar providers
- **AI Plans**: AI-generated daily optimization plans and suggestions
- **User Preferences**: Customizable user settings for AI recommendations
- **Sessions**: Secure session storage for authentication

## Data Flow

### Task Management Flow
1. User creates/updates tasks through the frontend interface
2. Task data is validated using Zod schemas and sent to the backend API
3. Backend stores task information in PostgreSQL via Drizzle ORM
4. Frontend updates UI state through TanStack Query cache invalidation

### Calendar Synchronization Flow
1. User authenticates with external calendar providers (Google Calendar)
2. Backend fetches calendar events using provider APIs
3. Events are normalized and stored in the database with external ID mapping
4. Frontend displays unified calendar view combining all sources

### AI Planning Flow
1. System retrieves user's tasks and calendar events for a given date
2. Data is sent to OpenAI GPT-4o with structured prompts for optimization
3. AI generates personalized scheduling suggestions and productivity insights
4. Results are stored in the database and displayed to the user
5. Users can regenerate plans with updated preferences

## External Dependencies

### Authentication & Session Management
- **Replit Auth**: Primary authentication provider using OpenID Connect
- **PostgreSQL Sessions**: Server-side session storage with connect-pg-simple

### AI & Calendar Services
- **OpenAI API**: GPT-4o model for intelligent planning and suggestions
- **Google Calendar API**: Calendar event synchronization and management
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling

### Development & Deployment
- **Vite**: Frontend build tool with hot module replacement
- **ESBuild**: Backend bundling for production deployment
- **TailwindCSS**: Utility-first CSS framework with custom design tokens

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Frontend development with hot reload
- **TSX**: TypeScript execution for backend development
- **Database Migrations**: Drizzle Kit for schema management

### Production Build Process
1. Frontend assets are built using Vite and output to `dist/public`
2. Backend is bundled using ESBuild with Node.js platform targeting
3. Static assets are served through Express middleware
4. Database migrations are applied using Drizzle Kit

### Environment Configuration
- **Database URL**: PostgreSQL connection string for Neon database
- **Authentication**: Replit Auth configuration with session secrets
- **API Keys**: OpenAI API key for AI functionality
- **Calendar Integration**: OAuth credentials for external calendar providers

## Changelog

Changelog:
- July 04, 2025. Initial setup
- July 05, 2025. Added Google Calendar and Outlook integration with OAuth 2.0 flows, calendar synchronization services, settings page, and dedicated calendar integration UI components

## User Preferences

Preferred communication style: Simple, everyday language.