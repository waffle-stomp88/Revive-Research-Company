# Revive Research - E-commerce Platform for Premium Peptide Research Compounds

## Overview

Revive Research is a modern e-commerce platform specializing in premium peptide research compounds. The application combines scientific credibility with a sleek, Apple-inspired design aesthetic, built on a full-stack TypeScript architecture with React frontend and Express backend.

The platform emphasizes transparency through third-party lab verification, providing Certificate of Authenticity (COA) verification for all products. It targets researchers and professionals seeking high-quality peptide compounds with verifiable testing results.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (alternative to React Router)
- Framer Motion for animations and page transitions

**UI Component System**
- Radix UI primitives for accessible, unstyled components (@radix-ui/*)
- shadcn/ui component architecture using the "new-york" style variant
- Tailwind CSS for utility-first styling with custom design tokens
- Typography system using Inter (body) and Space Grotesk (headlines) from Google Fonts
- Design philosophy inspired by Apple HIG, Linear, and Stripe—emphasizing minimalism, bold typography, and generous whitespace

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and API requests
- Custom query client with automatic error handling and credential inclusion
- React Hook Form with Zod validation for form state and validation

**Theming**
- Custom theme provider supporting light/dark modes with system preference detection
- CSS custom properties for dynamic color theming
- Theme persistence via localStorage

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for RESTful API
- HTTP server creation using Node's native `http` module
- Custom middleware for JSON parsing with raw body preservation (for webhook verification)
- Request logging middleware with timestamp formatting

**API Design**
- RESTful endpoints under `/api` prefix:
  - `GET /api/products` - Retrieve all products
  - `GET /api/products/:id` - Get single product details
  - `GET /api/coa/:batchNumber` - Verify Certificate of Authenticity
  - `POST /api/orders` - Create new orders
  - `POST /api/contact` - Submit contact inquiries
- Zod schema validation for request payloads

**Static File Serving**
- Vite-built production assets served from `dist/public`
- SPA fallback routing to `index.html` for client-side navigation
- Development mode uses Vite's middleware mode with HMR over `/vite-hmr` path

**Build Process**
- Custom build script using esbuild for server bundling
- Selective dependency bundling (allowlist) to reduce cold start times
- Vite handles client bundle generation
- Output to `dist/` directory with separate public assets folder

### Data Layer

**Database**
- PostgreSQL as the primary database (via Neon serverless driver `@neondatabase/serverless`)
- Drizzle ORM for type-safe database queries and migrations
- Schema definition in `shared/schema.ts` for code sharing between client/server

**Schema Design**
- **users**: Authentication with username/password (UUID primary keys)
- **products**: Peptide compounds with pricing, descriptions, categories, stock status, and featured flags
- **coas**: Certificate of Authenticity records linked to products by batch number
- **orders**: Customer orders with shipping details and order items
- **contacts**: Contact form submissions

**Development Storage**
- In-memory storage implementation (`MemStorage`) for development/testing
- Seed data for sample products including BPC-157 and other research peptides
- Interface-based storage abstraction (`IStorage`) for easy swapping between implementations

**Migrations**
- Drizzle Kit for schema migrations in `migrations/` directory
- `npm run db:push` script for pushing schema changes

### External Dependencies

**Third-Party Services**
- Neon Database: Serverless PostgreSQL hosting
- Google Fonts CDN: Inter and Space Grotesk typography
- Replit-specific integrations:
  - `@replit/vite-plugin-runtime-error-modal`: Development error overlay
  - `@replit/vite-plugin-cartographer`: Code mapping
  - `@replit/vite-plugin-dev-banner`: Development environment banner

**UI Component Libraries**
- Radix UI: 20+ primitive components for accessibility
- cmdk: Command palette component
- embla-carousel-react: Carousel/slider functionality
- lucide-react: Icon library

**Form & Validation**
- react-hook-form: Form state management
- @hookform/resolvers: Zod integration for validation
- zod: Runtime schema validation
- drizzle-zod: Generate Zod schemas from Drizzle tables

**Utilities**
- date-fns: Date manipulation and formatting
- clsx + tailwind-merge: Conditional className utilities (via cn helper)
- class-variance-authority: Component variant management
- nanoid: Unique ID generation

**Development Tools**
- tsx: TypeScript execution for development and build scripts
- TypeScript with strict mode and path aliases (@/, @shared/, @assets/)
- PostCSS with Tailwind and Autoprefixer