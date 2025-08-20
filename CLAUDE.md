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
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, Chakra UI v3
- **Backend**: Supabase (PostgreSQL database + Auth + Storage)
- **Authentication**: Supabase Auth with middleware-based route protection
- **Styling**: Tailwind CSS with custom Cresol brand colors + Chakra UI components
- **Icons**: Custom SVG icon components in `/app/components/icons/`
- **Image Handling**: `react-easy-crop` for image cropping
- **Date Handling**: `date-fns` for date formatting

### Additional Key Dependencies
- **Animation**: `framer-motion` for advanced animations and micro-interactions
- **Virtualization**: `@tanstack/react-virtual` for efficient large list rendering 
- **File Upload**: `tus-js-client` and `@tus/server` for resumable file uploads
- **Image Processing**: Custom cropping utilities in `lib/imageUtils.ts`
- **Date Handling**: `date-fns` for consistent date formatting across components
- **HTTP Client**: `axios` for API requests with custom error handling

### Key Architecture Patterns

#### Authentication & Authorization
- Uses Supabase Auth with custom middleware in `middleware.ts`
- Role-based access control with three levels:
  - `admin` - Full system access
  - `sector_admin` - Sector-specific admin access
  - `subsector_admin` - Subsector-specific admin access
  - `user` - Standard user access
- Auth state managed via Supabase client-side session handling
- Protected routes automatically redirect unauthenticated users to `/login`
- Optimized middleware authentication with caching in `lib/middleware-auth.ts`

#### Route Structure
- `/home` - Main landing page (requires auth)
- `/admin/*` - Full admin panel (admin role only)
  - `/admin/users` - User management with role assignment
  - `/admin/sectors` - Sector management
  - `/admin/sectors/[id]` - Individual sector management
  - `/admin/system-links` - System link management
  - `/admin/economic-indicators` - Economic data management
  - `/admin/banners` - Banner management
  - `/admin/gallery` - Image gallery management
  - `/admin/videos` - Video gallery management
  - `/admin/collections` - Collection management
  - `/admin/positions` - Position management
  - `/admin/work-locations` - Work location management
- `/admin-setor/*` - Sector admin panel (sector_admin + admin roles)
  - `/admin-setor/setores/[id]` - Sector-specific content management
- `/admin-subsetor/*` - Subsector admin panel
  - `/admin-subsetor/subsetores/[id]` - Subsector-specific content management
- `/setores/[id]` - Dynamic sector pages
- `/subsetores/[id]` - Dynamic subsector pages with team management
- `/mensagens` - Messages page
- `/mensagens/[id]` - Individual message view
- `/api/admin/*` - Admin API endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/notifications/*` - Notification API endpoints

#### Data Layer
- All database interactions use Supabase client
- RLS (Row Level Security) policies enforce data access controls
- Server-side operations use service role key for elevated permissions
- Client-side operations use anon key with user context
- Optimized database queries with connection pooling

#### Component Architecture
- Shared UI components in `/app/components/`
- Page-specific components co-located with pages
- Global components: `Navbar`, `Footer`, `GlobalSearch`
- Admin-specific components for user management, content management
- Custom icon system in `/app/components/icons/` with centralized `Icon.tsx` component
- UI utilities in `/app/components/ui/`: `ConfirmationModal`, `ErrorMessage`, `LoadingSpinner`, `ChakraCard`
- Specialized components: `BannerCarousel`, `EconomicIndicators`, `SystemLinks`
- Alert system in `/app/components/alerts/` with Chakra UI integration

### Database Schema (Key Tables)
- `profiles` - User profiles with role assignments and sector associations
- `sectors` - Organizational sectors/departments
- `subsectors` - Sub-departments within sectors with team member management
- `economic_indicators` - Economic data display with admin management
- `access_requests` - User access approval workflow
- `system_links` - Centralized system link management
- `banners` - Homepage banner management
- `gallery_images` - Image gallery with categorization
- `videos` - Video gallery management
- `collections` - Collection management for grouped content
- `positions` - Job positions
- `work_locations` - Work locations
- `message_groups` - Message groups for targeted communication
- `sector_messages` - Sector-specific messages
- `subsector_messages` - Subsector-specific messages

### File Upload & Storage
- Uses Supabase Storage with public `images` bucket
- Supports image uploads for avatars, banners, gallery
- Image cropping functionality with `react-easy-crop`
- Organized by folders: `avatars/`, `sector-news/`, `banners/`, `uploads/`, `thumbnails/`

### Styling System
- Custom Tailwind config with Cresol brand colors:
  - Primary: `#F58220` (Cresol Orange)
  - Secondary: `#005C46` (Cresol Green)
  - Custom gray scale and aliases
- Responsive design with mobile-first approach
- Component-specific styling patterns
- Border radius standardization (primary: 6px/md)
- Custom scrollbar utilities for consistent UX
- Enhanced animation utilities (shimmer, pulse-slow, fade-in, slide-up, scale-in)
- Chakra UI v3 integration for modern component library

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
- Optimized auth caching to reduce database load

### Notable Implementation Details
- Custom error handling in `lib/error-handler.ts`
- SSR-compatible Supabase client setup in `lib/supabase/`
- Middleware-based authentication in `middleware.ts` with role-based route protection
- Image cropping utility in `app/components/getCroppedImg.ts`
- Economic indicators integration with admin management interface
- Comprehensive user role management with direct role updates
- Advanced search functionality with filters
- File upload handling for images, banners, and videos
- Messaging system with hierarchical organization (sector/subsector)

### Development Workflow
1. Changes should maintain existing authentication patterns
2. New admin features require proper role checks in both middleware and API routes
3. Database changes should include RLS policy updates
4. Component changes should follow existing Tailwind patterns with Cresol brand colors
5. API routes should include proper error handling and role verification
6. Use existing icon components from `/app/components/icons/` instead of external libraries
7. Follow the established file upload patterns for Supabase Storage
8. Maintain consistency with existing modal and confirmation patterns
9. Use Chakra UI components when appropriate for better UX

### Testing
- No specific test framework configured - verify functionality manually
- Test role-based access control thoroughly
- Verify RLS policies work correctly with different user roles
- Test file upload functionality with proper error handling

### Video System Architecture
- **Upload Types**: YouTube, Vimeo, and direct file uploads supported
- **File Processing**: Thumbnail generation with `lib/thumbnail-generator.ts`
- **Storage**: Organized in Supabase storage with folder structure (`uploads/`, `thumbnails/`)
- **UI Components**: Modular video system in `app/components/VideoGallery/`
- **Configuration**: Centralized video constants in `lib/constants/video-ui.ts`

### Performance Optimizations
- **Image Optimization**: Next.js Image component with Vercel-optimized settings
- **Virtual Scrolling**: For large datasets using `@tanstack/react-virtual`
- **Caching**: Strategic caching for video thumbnails and economic indicators
- **Bundle Optimization**: SWC minification enabled in `next.config.js`
- **Auth Caching**: Middleware-level authentication caching to reduce database queries

## Design Guidelines

### UI/UX Principles
- Não usar emoji nos componentes, e usar ícones somente quando realmente necessário
- Manter consistência com o design system existente usando componentes padronizados
- Priorizar simplicidade e clareza na interface
- Use Chakra UI v3 components for consistent design patterns

## Development Best Practices

### Environment Management
- Sempre fechar a porta de desenvolvimento que for usada para teste
- Usar porta 4000 para desenvolvimento local
- Manter variáveis sensíveis fora do código-fonte

### Code Organization
- Componentes de página co-localizados com as páginas
- Componentes compartilhados em `/app/components/`
- Utilitários e helpers em `/lib/`
- Tipos TypeScript em `/types/`
- Constantes de design em `/lib/design-tokens/`
- Contextos React em componentes específicos de página (ex: `/app/admin/sectors/[id]/contexts/`)

# Important Instruction Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
- Sempre use agents indicados nos prompts, caso não seja indicado nenhum agente explicitamente, procure o agent mais qualificado para a task