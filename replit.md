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

# Recent Changes (Janeiro 2025)

## Sistema de Hierarquia e Permissões Implementado (11/01/2025)
- ✓ Sistema completo de 3 hierarquias: Colaborador → Supervisor → Administrador
- ✓ Controle granular de permissões baseado em roles e departamentos
- ✓ Middleware de proteção de rotas no backend com filtragem automática de tickets
- ✓ Componentes de proteção no frontend (PermissionGuard, AdminOnly, SupervisorOnly)
- ✓ Interface de configuração de permissões para administradores
- ✓ Sistema de filtragem de tickets baseado na hierarquia do usuário
- ✓ Demonstração funcional das hierarquias em /hierarchy-demo
- ✓ Proteção de rotas administrativas (departamentos, usuários, configurações)

### Regras de Hierarquia Implementadas:
- **Colaborador**: Vê apenas seus próprios tickets, pode criar tickets
- **Supervisor**: Gerencia usuários e tickets do próprio departamento, acesso a relatórios departamentais
- **Administrador**: Acesso total ao sistema, gerencia todos os departamentos e usuários

### Proteções de Rota:
- `/departments` - Apenas administradores
- `/permissions` - Apenas administradores  
- `/users` - Supervisores e administradores
- `/analytics`, `/reports` - Supervisores e administradores
- `/categories`, `/forms`, `/fields` - Supervisores e administradores

# Recent Changes (August 2025)

## Identidade Visual OPUS e Sistema de Hierarquias Corrigido (11/08/2025)
- ✓ Avatar com gradiente OPUS aplicado em todos os cartões de usuário (from-[#2c4257] to-[#6b8fb0])
- ✓ Sistema de hierarquias corrigido para usar valores corretos: 'administrador', 'supervisor', 'colaborador'
- ✓ Mapeamento de cores e nomes das hierarquias atualizado em todos os componentes
- ✓ Interface de usuários simplificada: removidos botões "Ligar" e "Email", mantidos apenas visualizar (olho) e menu (três pontos)  
- ✓ Menu dropdown implementado com opções "Editar usuário" e "Deletar usuário" com confirmação
- ✓ Dados de exemplo atualizados para refletir as hierarquias corretas do sistema
- ✓ Acesso à página de configuração de hierarquias disponível em /hierarchy (apenas administradores)

# Recent Changes (August 2025)

## Identidade Visual Grupo OPUS (Janeiro 2025)
- ✓ Logo do Grupo OPUS implementada na barra superior (header)
- ✓ Identidade visual aplicada com cores azul escuro (#2c4257) e azul claro (#6b8fb0)
- ✓ Paleta de cores CSS personalizada para refletir a marca OPUS
- ✓ Sistema de cores primárias e secundárias alinhado à identidade da empresa
- ✓ Logo posicionada sozinha no topo, sidebar mantém "TicketFlow Pro" original

## Migração do Replit Agent Concluída (Janeiro 2025)
- ✓ Sistema migrado com sucesso do Replit Agent para ambiente Replit padrão
- ✓ Banco PostgreSQL configurado e migrações executadas
- ✓ Todas as dependências instaladas (tsx, etc.)
- ✓ Barras de SLA corrigidas para mostrar progresso real baseado no tempo de criação do ticket
- ✓ Servidor funcionando corretamente na porta 5000
- ✓ Interface de usuário carregando sem erros

## Three-Tier User Hierarchy System (NEW)
- **User Hierarchy**: Implemented colaborador → supervisor → administrador system replacing simple admin/user roles
- **Role-Based Access**: Each hierarchy level has specific permissions and access controls
- **Demo Data**: Updated with users representing all three hierarchy levels for testing

## Department-Based Access Control System 
- **Multi-Department Support**: Added department/workgroup system for sector isolation
- **Database Schema**: Enhanced with departments table and user/ticket department associations
- **Access Control**: Each department can only see their own tickets and users

## Functional Report Filters System (NEW)
- **Real-Time Filtering**: All reports now connect to PostgreSQL with functional filters
- **Advanced Analytics**: Department performance, user performance, and resolution time analysis
- **Dynamic Data**: Charts and tables update automatically based on filter selections
- **Comprehensive APIs**: Backend endpoints supporting date ranges, department, priority, and status filtering
- **Professional Reports**: 7 specialized reports focused on SLA, aging, satisfaction, and performance analytics

## Dashboard-to-Tickets Navigation System (NEW - Jan 2025)
- **Clickable Dashboard Cards**: All StatsCard components now navigate to filtered ticket views
- **Smart URL Filtering**: KanbanBoard accepts URL parameters to automatically apply filters
- **Team & Department Navigation**: Performance metrics link to user-specific and department-specific ticket views
- **Seamless User Experience**: Dashboard analytics now directly connect to relevant ticket management pages

## Enterprise Features Completed
- **Advanced Reporting**: 8 comprehensive analysis tabs including SLA monitoring, aging analysis, daily volume tracking
- **SLA Management**: Complete SLA compliance tracking with risk alerts and priority-based timelines
- **Ticket Aging Analysis**: Visual breakdown of ticket age distribution and backlog management
- **Daily Volume Reports**: Comprehensive analysis of ticket volume patterns and resolution rates  
- **Satisfaction Tracking**: Customer feedback analysis with rating distribution and comment highlights
- **Trend Analysis**: Fixed ticket trends visualization with distributed historical data
- **Categories Management**: Complete category and subcategory system with SLA configuration
- **Ticket Forms**: Custom form builder for different ticket types and contexts  
- **Custom Fields**: Configurable field system with multiple input types
- **Workflow Approvals**: Sequential approval system with status tracking

## Technical Improvements
- **Database Migration**: PostgreSQL integration with proper schema design
- **Fixed Trend Charts**: Resolved data distribution issues for realistic visualizations
- **Enhanced Routing**: Added new pages to routing system with proper navigation
- **UI Components**: Implemented enterprise-level interfaces matching reference design
- **Performance**: Optimized data queries and chart rendering
- **SLA Configuration**: Added comprehensive SLA management page with CRUD operations
- **Ticket Deletion**: Implemented admin-only ticket deletion with cascade operations for comments and attachments
- **SelectItem Validation**: Fixed React Select validation errors for empty values

## Replit Migration (January 2025)
- **Environment Setup**: Successfully migrated from Replit Agent to Replit environment
- **Database Configuration**: PostgreSQL database provisioned and configured with proper schema
- **SLA Progress Bar**: Fixed to calculate real-time progress based on elapsed time since ticket creation
- **Timestamp Issues**: Resolved database timestamp conflicts in status/priority config updates
- **Portuguese Translation**: Changed "Ticket" to "Chamado" for better localization
- **Real-time SLA Tracking**: Progress bars now reflect actual time elapsed vs. SLA deadlines with proper color coding
- **SLA Configuration Integration**: SLA calculations now pull from admin-configured priority settings instead of hardcoded values
- **Badge Translation Fix**: Status and priority badges now display Portuguese names from configuration instead of English database values
- **Dynamic Color System**: All status and priority colors now reflect admin configurations across Kanban, modals, and tables
- **SLA Hierarchy Implementation**: SLA calculations follow proper hierarchy: SLA Rules → Priority Config → 24h fallback