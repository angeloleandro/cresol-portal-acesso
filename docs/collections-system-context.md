# COLLECTIONS SYSTEM - CONTEXT OPTIMIZADO PARA IMPLEMENTAÇÃO

Contexto especializado para desenvolvimento eficiente do sistema de coleções baseado na arquitetura existente do Portal Cresol.

## 📋 CONTEXTO ESSENCIAL

### Arquitetura Base Portal Cresol
- **Framework**: Next.js 14 + App Router + TypeScript
- **DB**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **UI**: Tailwind CSS + Custom Design Tokens
- **Auth**: Supabase Auth com middleware + role-based access
- **Estrutura**: `/app/admin/*`, `/app/components/*`, `/lib/*`

### Sistema Atual Gallery
```typescript
// Estrutura existente para expansão
interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  is_active: boolean;
  order_index: number;
}
```

### Design System Disponível
```typescript
// De lib/design-tokens/ui-config.ts
CRESOL_UI_CONFIG.{button,card,input,modal,spinner,badge,table,form}
```

## 🏗️ TEMPLATES DE IMPLEMENTAÇÃO

### 1. API Route Template
```typescript
// /app/api/admin/collections/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Role check pattern
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 2. Admin Page Template
```typescript
// /app/admin/collections/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/app/components/AdminHeader";
import Breadcrumb from "@/app/components/Breadcrumb";
import { StandardizedButton } from "@/app/components/admin";
import { AdminSpinner } from '@/app/components/ui/StandardizedSpinner';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminCollections() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auth pattern from gallery/page.tsx
  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }
      setUser(userData.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();
      if (profile?.role === "admin") {
        setIsAdmin(true);
      } else {
        router.replace("/dashboard");
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) {
    return <AdminSpinner fullScreen message="Carregando..." size="lg" />;
  }

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      <AdminHeader user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Coleções' }
            ]} 
          />
        </div>
        {/* Content implementation here */}
      </main>
    </div>
  );
}
```

### 3. Component Template (Standard)
```typescript
// /app/components/CollectionCard.tsx
import { CRESOL_UI_CONFIG } from '@/lib/design-tokens/ui-config';
import OptimizedImage from '@/app/components/OptimizedImage';

interface CollectionCardProps {
  collection: Collection;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

export default function CollectionCard({ collection, onEdit, onDelete }: CollectionCardProps) {
  return (
    <div className={`${CRESOL_UI_CONFIG.card.base} ${CRESOL_UI_CONFIG.card.variants.hover}`}>
      <div className={CRESOL_UI_CONFIG.card.padding.md}>
        {/* Content implementation */}
      </div>
    </div>
  );
}
```

### 4. Database Migration Template
```sql
-- migrations/[timestamp]_create_collections.sql
CREATE TABLE collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- RLS Policies
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections are viewable by everyone"
  ON collections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage collections"
  ON collections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

## 📦 CONTEXT PACKAGES POR SPRINT

### Sprint 1: Foundation (2 weeks)
**Essential Context:**
- Gallery admin pattern: `/app/admin/gallery/page.tsx`
- Auth middleware pattern: `middleware.ts`
- UI Config tokens: `lib/design-tokens/ui-config.ts`
- API route pattern: `/app/api/admin/gallery/route.ts`

**Key Patterns:**
```typescript
// Auth check pattern
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", userData.user.id)
  .single();

// Standard loading pattern
if (loading) {
  return <AdminSpinner fullScreen message="Carregando..." size="lg" />;
}
```

### Sprint 2: Core CRUD (2 weeks)
**Essential Context:**
- Form handling: `app/components/ImageUploadForm.tsx`
- Modal pattern: `app/components/ui/ConfirmationModal.tsx`
- Error handling: `lib/error-handler.ts`

**Key Patterns:**
```typescript
// CRUD pattern
const handleCreate = async (data: CreateCollectionData) => {
  try {
    setLoading(true);
    const response = await fetch('/api/admin/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create');
    await fetchCollections();
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Sprint 3: Items Management (2 weeks)
**Essential Context:**
- Nested CRUD pattern from video system
- File upload: `lib/imageUtils.ts`
- Supabase Storage pattern

### Sprint 4: Advanced Features (2 weeks)
**Essential Context:**
- Drag & Drop: Research react-beautiful-dnd integration
- Search: `app/components/GlobalSearch.tsx` pattern
- Filtering: Similar component patterns

### Sprint 5: Performance (1 week)
**Essential Context:**
- Image optimization: `app/components/OptimizedImage.tsx`
- Virtual scrolling: `@tanstack/react-virtual` pattern
- Caching strategies

### Sprint 6: Testing & Polish (1 week)
**Essential Context:**
- Error boundaries
- Loading states
- UX polish patterns

## 🔧 DEVELOPMENT UTILITIES

### Quick DB Schema Checker
```bash
# Check current gallery schema for reference
supabase db describe gallery_images

# Check profiles for role patterns
supabase db describe profiles
```

### Component Generator Pattern
```bash
# Create new component following pattern
mkdir app/components/Collections
touch app/components/Collections/CollectionCard.tsx
touch app/components/Collections/CollectionForm.tsx
touch app/components/Collections/CollectionList.tsx
touch app/components/Collections/index.ts
```

### API Route Generator
```bash
# Standard API structure
mkdir -p app/api/admin/collections/[id]
touch app/api/admin/collections/route.ts
touch app/api/admin/collections/[id]/route.ts
```

## ⚡ TOKEN OPTIMIZATION STRATEGIES

### Compressed Development Context
```yaml
# Essential abbreviations for development
cfg: configuration, settings
impl: implementation, code structure  
val: validation, verification
auth: authentication, authorization
admin: administrative functions
crud: create, read, update, delete operations
rls: row level security policies
ui: user interface components
```

### Context Caching Keys
- `gallery-pattern`: Admin gallery implementation reference
- `auth-flow`: Authentication and authorization patterns
- `ui-tokens`: Design system configuration
- `db-patterns`: Database and RLS patterns
- `file-upload`: Supabase storage integration

### Reusable Code Snippets
```typescript
// Standard imports block
import { supabase } from "@/lib/supabase";
import { CRESOL_UI_CONFIG } from '@/lib/design-tokens/ui-config';
import { StandardizedButton } from "@/app/components/admin";
import { AdminSpinner } from '@/app/components/ui/StandardizedSpinner';

// Standard error handling
try {
  // operation
} catch (error: any) {
  setError(error.message || 'Erro inesperado');
  console.error('Operation failed:', error);
}
```

## 🎯 QUALITY GATES & VALIDATION

### Pre-Implementation Checklist
- [ ] Auth patterns match existing gallery admin
- [ ] UI components use CRESOL_UI_CONFIG tokens
- [ ] API routes follow existing auth patterns
- [ ] Database schema includes proper RLS policies
- [ ] Components follow existing TypeScript patterns

### Implementation Validation
- [ ] Role-based access control working
- [ ] Error handling comprehensive
- [ ] Loading states implemented
- [ ] Responsive design maintained
- [ ] Accessibility attributes present

### Performance Validation
- [ ] Image optimization implemented
- [ ] Database queries optimized
- [ ] Component renders efficiently
- [ ] Bundle size impact measured
- [ ] Mobile performance tested

## 📚 KNOWLEDGE TRANSFER TEMPLATES

### Architecture Decision Record
```markdown
# ADR: Collections System Database Schema

## Status: Accepted

## Context:
Extending existing gallery system for full collections management

## Decision:
Use hierarchical structure: collections -> collection_items

## Rationale:
- Leverages existing patterns from gallery_images
- Maintains consistency with current RLS policies
- Supports future expansion for nested collections

## Consequences:
+ Familiar patterns for developers
+ Existing auth system works unchanged
- Requires careful index optimization for performance
```

### Troubleshooting Guide
```markdown
# Collections System Troubleshooting

## Auth Issues
**Symptom**: User redirected to login
**Check**: middleware.ts coverage for new routes
**Solution**: Add collections routes to middleware config

## RLS Policy Issues
**Symptom**: Database access denied
**Check**: Profile role assignment and policy syntax  
**Solution**: Verify admin role in profiles table

## Image Upload Issues
**Symptom**: Upload fails silently
**Check**: Supabase storage bucket permissions
**Solution**: Verify public bucket access in Supabase dashboard
```

---

**CONTEXTO COMPLETO PRONTO PARA IMPLEMENTAÇÃO EFICIENTE**
- Templates copy-paste ready
- Patterns proven em production
- Token optimization implementado  
- Quality gates definidos
- Knowledge transfer estruturado