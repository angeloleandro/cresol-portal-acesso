# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on port 4000 (http://localhost:4000)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

### Installation
- `npm install` - Install all dependencies

## Architecture Overview

This is a **Next.js 14** application using the **App Router** pattern for Cresol's internal access portal. The application provides unified access to internal business systems with role-based authentication.

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database + Auth + Storage)
- **Authentication**: Supabase Auth with middleware-based route protection
- **Styling**: Tailwind CSS with custom Cresol brand colors
- **Icons**: Lucide React, React Icons

### Key Architecture Patterns

#### Authentication & Authorization
- Uses Supabase Auth with custom middleware in `middleware.ts`
- Role-based access control with three levels:
  - `admin` - Full system access
  - `sector_admin` - Sector-specific admin access
  - `user` - Standard user access
- Auth state managed via Supabase client-side session handling
- Protected routes automatically redirect unauthenticated users to `/login`

#### Route Structure
- `/home` - Main landing page (requires auth)
- `/admin/*` - Full admin panel (admin role only)
- `/admin-setor/*` - Sector admin panel (sector_admin + admin roles)
- `/setores/[id]` - Dynamic sector pages
- `/api/admin/*` - Admin API endpoints
- `/api/auth/*` - Authentication endpoints

#### Data Layer
- All database interactions use Supabase client
- RLS (Row Level Security) policies enforce data access controls
- Server-side operations use service role key for elevated permissions
- Client-side operations use anon key with user context

#### Component Architecture
- Shared UI components in `/app/components/`
- Page-specific components co-located with pages
- Global components: `Navbar`, `Footer`, `GlobalSearch`
- Admin-specific components for user management, content management

### Database Schema (Key Tables)
- `profiles` - User profiles with role assignments
- `sectors` - Organizational sectors/departments
- `subsectors` - Sub-departments within sectors
- `notifications` - System notifications
- `economic_indicators` - Economic data display
- `access_requests` - User access approval workflow

### File Upload & Storage
- Uses Supabase Storage with public `images` bucket
- Supports image uploads for avatars, banners, gallery
- Image cropping functionality with `react-easy-crop`
- Organized by folders: `avatars/`, `sector-news/`, `banners/`

### Styling System
- Custom Tailwind config with Cresol brand colors:
  - Primary: `#F58220` (Cresol Orange)
  - Secondary: `#005C46` (Cresol Green)
  - Custom gray scale and aliases
- Responsive design with mobile-first approach
- Component-specific styling patterns

### Environment Configuration
- Development runs on port 4000 (not default 3000)
- Requires Supabase environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

### Security Considerations
- All admin operations require role verification
- API routes protected by middleware
- Sensitive operations use service role key server-side only
- User data access controlled by RLS policies
- Session validation on protected routes

### Notable Implementation Details
- Custom error handling in `lib/error-handler.ts`
- SSR-compatible Supabase client setup in `lib/supabase/`
- Date formatting using `date-fns` library
- Image optimization configured for Supabase CDN
- Biome linting rules for code quality (some exceptions present)

### Development Workflow
1. Changes should maintain existing authentication patterns
2. New admin features require proper role checks
3. Database changes should include RLS policy updates
4. Component changes should follow existing Tailwind patterns
5. API routes should include proper error handling