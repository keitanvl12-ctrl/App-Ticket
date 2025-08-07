# Overview

TicketFlow Pro is a modern, full-stack ticket management system built with React and Node.js. It provides a comprehensive dashboard for tracking support tickets, managing team members, and analyzing performance metrics. The application features a clean, responsive interface with real-time data visualization, efficient ticket workflow management, and advanced enterprise features including workflow approvals, custom forms, and SLA management.

# User Preferences

Preferred communication style: Simple, everyday language.
Language: Sistema completo traduzido para português brasileiro (interface, formulários, dados de exemplo).

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: Redux Toolkit for global state and TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: TailwindCSS with CSS variables for theme customization and responsive design
- **Charts**: Recharts for data visualization and analytics dashboards

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **API Design**: RESTful endpoints with consistent error handling and request logging
- **Development**: Hot reload with Vite middleware integration
- **Storage**: In-memory storage implementation (MemStorage) for development with interface for easy database integration

## Data Layer
- **Database**: PostgreSQL with Drizzle schema definitions
- **Schema**: Well-structured tables for users, tickets, comments, and attachments with proper foreign key relationships
- **Validation**: Zod schemas for runtime type checking and validation
- **Migrations**: Drizzle Kit for database schema migrations

## Authentication & Authorization
- **User Management**: Role-based access control (admin/user roles)
- **Session Management**: Session-based authentication with PostgreSQL session store

## Component Architecture
- **Layout System**: Consistent layout with sidebar navigation and top bar
- **Form Management**: React Hook Form with Zod resolvers for validation
- **Modal System**: Reusable modal components for ticket creation and editing
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Advanced Workflow**: Approval system with sequential workflow management
- **Custom Forms**: Dynamic form builder with configurable fields
- **Category Management**: Hierarchical categories with SLA configuration

# External Dependencies

## Core Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **State Management**: Redux Toolkit, TanStack React Query
- **UI Framework**: Radix UI components, Lucide React icons
- **Styling**: TailwindCSS, class-variance-authority, clsx for conditional classes
- **Charts**: Recharts for data visualization
- **Animation**: Framer Motion for smooth UI transitions

## Backend Dependencies
- **Server**: Express.js with middleware for JSON parsing and CORS
- **Database**: Drizzle ORM, @neondatabase/serverless for PostgreSQL connection
- **Session Store**: connect-pg-simple for PostgreSQL session management
- **Utilities**: date-fns for date manipulation, nanoid for ID generation

## Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Database**: Drizzle Kit for migrations and schema management
- **Code Quality**: TypeScript for static type checking
- **Development**: tsx for running TypeScript files, Replit development plugins

## UI Component System
- **Design System**: shadcn/ui components built on Radix UI primitives
- **Icons**: Lucide React icon library
- **Theming**: CSS custom properties for consistent color schemes
- **Typography**: Inter font family from Google Fonts

# Recent Changes (January 2025)

## New Enterprise Features Added
- **Categories Management**: Complete category and subcategory system with SLA configuration
- **Ticket Forms**: Custom form builder for different ticket types and contexts  
- **Custom Fields**: Configurable field system with multiple input types
- **Workflow Approvals**: Sequential approval system with status tracking
- **Enhanced Navigation**: Expanded administration menu with all new features

## Technical Improvements
- **Fixed SelectItem Issues**: Resolved empty value props causing console errors
- **Enhanced Routing**: Added new pages to routing system with proper navigation
- **UI Components**: Implemented enterprise-level interfaces matching reference design
- **Sidebar Updates**: Added new administration submenu items

## Interface Enhancements
- **Hierarchical Categories**: Tree-view display with expand/collapse functionality
- **Approval Flow Visualization**: Step-by-step approval tracking with status icons
- **Form Configuration**: Visual form builder with field type selection
- **Priority and Status Badges**: Color-coded status indicators throughout interface