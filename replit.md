# Productivity Dashboard Application

## Overview

A comprehensive productivity dashboard application built with React, TypeScript, Express.js, and PostgreSQL. The application provides task management, activity tracking, note-taking, focus timers, and calendar integration features to help users optimize their daily productivity.

## System Architecture

The application follows a full-stack architecture with clear separation between client and server components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints
- **Development Mode**: Hot reload with Vite middleware integration

### Database Architecture
- **Database**: PostgreSQL with Drizzle ORM (migrated from in-memory storage)
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Connection**: Neon Database serverless PostgreSQL via Replit database module
- **Data Persistence**: All user data, activities, and metrics are now persistently stored
- **Demo Data**: Automatic initialization with sample browser activities and health metrics

## Key Components

### Task Management System
- Task creation, editing, and deletion
- Priority levels (low, medium, high)
- Category organization (work, personal, learning)
- Status tracking (pending, completed)
- Time estimation and tracking
- Due date management

### Activity Tracking
- Automatic activity categorization
- Time spent analysis
- Productivity metrics and statistics
- Daily, weekly, and monthly reporting

### Smart Notes System
- Rich text note creation and editing
- Tag-based organization
- Search functionality
- Category classification
- Timestamp tracking

### Focus Timer (Pomodoro)
- 25-minute focus sessions
- Break time management
- Session completion tracking
- Progress visualization
- Focus mode overlay

### Calendar Integration
- Event scheduling and management
- Daily agenda view
- Event categorization
- Time conflict detection

### Quick Capture Modal
- Voice-to-text input support
- Rapid task and note creation
- Smart categorization
- Keyboard shortcuts

### Daily Journaling System
- **Structured Entries**: Date-based journal entries with rich text content
- **Mood Tracking**: Visual mood selection with emoji indicators
- **Structured Sections**: Highlights, gratitude, challenges, and tomorrow's goals
- **Tag System**: Flexible tagging for easy categorization and search
- **Weather Integration**: Track daily weather conditions
- **Privacy Controls**: Private entries with user-controlled visibility
- **Date Navigation**: Easy browsing through past journal entries
- **Auto-save**: Prevents data loss with automatic saving functionality

### Plain Notepad
- **Always Available**: Accessible in both normal and focus modes
- **Auto-save**: Local storage with automatic saving every 2 seconds
- **Clean Interface**: Distraction-free writing experience
- **Focus Optimization**: Larger text area and enhanced styling in focus mode
- **Monospace Font**: Clean, readable coding font for better text clarity

### Universal Health Device Integration
- **Apple Watch**: HealthKit integration with high accuracy tracking
- **Android Watches**: Google Fit and Samsung Health compatibility
- **Fitbit Devices**: Web API integration for comprehensive fitness data
- **Smart Glasses**: AR/VR fitness tracking and activity monitoring
- **Smart Rings**: Oura Ring and similar devices for sleep and recovery
- Multi-device auto-detection and seamless data synchronization
- Device-specific accuracy profiling and data validation

### Adaptive Ambient Soundscapes
- **Nature Sounds**: Rain, ocean waves, forest ambience, waterfall
- **Marine Life**: Whale songs and underwater environments
- **Instrumental**: Piano, acoustic guitar, string ensemble arrangements
- **Smart Adaptation**: Auto-selects sounds based on work mode and time
- **Custom Preferences**: User-defined sound libraries and volume controls
- **Work Mode Integration**: Adapts to focus, creative, coding, meditation modes
- **Web Audio API**: High-quality procedural sound generation

## Data Flow

1. **Client Requests**: React components use TanStack Query to make API requests
2. **API Processing**: Express.js routes handle requests and validate data using Zod schemas
3. **Database Operations**: Drizzle ORM performs type-safe database operations
4. **Response Handling**: Data flows back through the API to update client state
5. **UI Updates**: React components re-render based on updated query cache

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **wouter**: Lightweight routing library
- **date-fns**: Date manipulation and formatting

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Fast build tool and dev server
- **typescript**: Type safety and development experience
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- Replit-optimized configuration with hot reload
- Vite dev server with Express.js middleware integration
- PostgreSQL database provisioning through Replit modules
- Environment variable management for database connections

### Production Build
- Frontend: Vite builds optimized React application
- Backend: esbuild bundles Express.js server with external dependencies
- Database: Drizzle migrations ensure schema consistency
- Deployment: Replit autoscale deployment with health checks

### Environment Configuration
- Database URL configuration through environment variables
- Port configuration for Replit deployment (5000 -> 80)
- Build scripts optimized for production deployment

## Changelog

- June 24, 2025. Initial setup and basic dashboard implementation
- June 24, 2025. Enhanced with browser activity tracking, Apple Watch integration, smart focus mode, and weekly reporting features
- June 24, 2025. Migrated from in-memory storage to PostgreSQL database with persistent data storage

## Recent Changes

✓ Added comprehensive browser activity tracking with real-time categorization
✓ Implemented universal health metrics integration (Apple Watch, Android, Fitbit, smart glasses, smart rings)
✓ Created smart focus mode that automatically activates during development work
✓ Built weekly report generation with productivity insights and recommendations
✓ Enhanced quick capture with voice-to-text functionality
✓ Added premium glass design with teal/charcoal color scheme (no purple)
✓ **Migrated to PostgreSQL database for persistent data storage and scalability**
✓ **Enhanced health integration with multi-device support and device-specific accuracy profiling**
✓ **Added adaptive ambient soundscapes with nature sounds, instruments, and smart work mode detection**
✓ **Created comprehensive admin dashboard for application owner analytics and usage insights**
✓ **Fixed critical authentication bugs and database migration issues**
✓ **Added operational cost tracking dashboard showing infrastructure expenses and resource consumption analysis**
✓ **Replaced stats overview grid with plain notepad component for seamless writing experience**
✓ **Implemented comprehensive journaling/diary feature with structured daily entries, mood tracking, gratitude sections, and goal setting**

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Clean, minimalistic design with premium glass effects. No purple colors - prefer teal/charcoal theme.