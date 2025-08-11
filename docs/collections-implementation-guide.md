# COLLECTIONS SYSTEM - GUIA DE IMPLEMENTAÇÃO EXECUTÁVEL

Guia prático para implementação do sistema de coleções com contexts otimizados por sprint e templates prontos para uso.

## 🏃‍♂️ QUICK START IMPLEMENTATION

### Pré-requisitos Técnicos
```bash
# Ambiente já configurado no Portal Cresol
✅ Next.js 14 + TypeScript
✅ Supabase (DB + Auth + Storage)  
✅ Tailwind + Design Tokens
✅ Admin auth patterns
✅ Gallery system (base para expansão)
```

### Setup Inicial (5 minutos)
```bash
# 1. Criar estrutura de pastas
mkdir -p app/admin/collections
mkdir -p app/components/Collections  
mkdir -p app/api/admin/collections/[id]

# 2. Verificar permissões existentes
# Admin role já configurado em profiles table

# 3. Database migration pronta para aplicar
# Ver seção Database Schema abaixo
```

## 📋 ROADMAP EXECUTÁVEL - 6 SPRINTS

### SPRINT 1: Foundation & Database (2 weeks)
**🎯 Goal**: Setup base + basic CRUD operations

**Context essencial:**
```typescript
// Pattern base: /app/admin/gallery/page.tsx (linha 36-72)
// Auth: middleware.ts pattern
// UI: CRESOL_UI_CONFIG from lib/design-tokens/ui-config.ts
```

**Tasks com templates:**

**Task 1.1**: Database Schema
```sql
-- Copy-paste ready migration
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

CREATE TABLE collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  external_url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_collections_active ON collections(is_active, order_index);
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id, order_index);

-- RLS Policies (copy existing gallery pattern)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections viewable by all" ON collections FOR SELECT USING (is_active = true);
CREATE POLICY "Collection items viewable by all" ON collection_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admin collections management" ON collections FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin collection items management" ON collection_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
```

**Task 1.2**: API Routes Foundation
```typescript
// app/api/admin/collections/route.ts - Template completo
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface CreateCollectionRequest {
  name: string;
  description?: string;
  cover_image_url?: string;
  is_active?: boolean;
  order_index?: number;
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Auth pattern from gallery API
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
      .select(`
        *,
        collection_items (
          id,
          name,
          description,
          image_url,
          is_active,
          order_index
        )
      `)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body: CreateCollectionRequest = await request.json();
    
    const { data, error } = await supabase
      .from('collections')
      .insert({
        ...body,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Task 1.3**: Admin Page Foundation
```typescript
// app/admin/collections/page.tsx - Template baseado em gallery/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/app/components/AdminHeader";
import Breadcrumb from "@/app/components/Breadcrumb";
import { StandardizedButton } from "@/app/components/admin";
import { AdminSpinner } from '@/app/components/ui/StandardizedSpinner';
import { CRESOL_UI_CONFIG } from '@/lib/design-tokens/ui-config';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  collection_items?: CollectionItem[];
}

interface CollectionItem {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  order_index: number;
}

export default function AdminCollections() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Exact auth pattern from gallery
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

  useEffect(() => {
    if (isAdmin) fetchCollections();
  }, [isAdmin]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/collections');
      if (!response.ok) throw new Error('Failed to fetch collections');
      const data = await response.json();
      setCollections(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AdminSpinner fullScreen message="Carregando coleções..." size="lg" />;
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

        {/* Header Section */}
        <div className="mb-6">
          <div className={`${CRESOL_UI_CONFIG.card.base} ${CRESOL_UI_CONFIG.card.padding.md}`}>
            <h1 className="text-3xl font-bold text-primary mb-1">
              Gerenciar Coleções
            </h1>
            <p className="text-sm text-gray-600">
              Organize conteúdo em coleções temáticas para melhor apresentação no portal
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <StandardizedButton variant="primary" onClick={() => {}}>
            + Nova Coleção
          </StandardizedButton>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            Erro: {error}
          </div>
        )}

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div key={collection.id} className={`${CRESOL_UI_CONFIG.card.base} ${CRESOL_UI_CONFIG.card.variants.hover}`}>
              <div className={CRESOL_UI_CONFIG.card.padding.md}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {collection.collection_items?.length || 0} itens
                  </span>
                  <div className="flex gap-2">
                    <button className="text-primary hover:underline text-sm">
                      Gerenciar
                    </button>
                    <button className="text-red-500 hover:underline text-sm">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {collections.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            Nenhuma coleção cadastrada ainda. Crie sua primeira coleção!
          </div>
        )}
      </main>
    </div>
  );
}
```

**Validation Gates Sprint 1:**
- [ ] Database schema applied successfully  
- [ ] API routes returning data correctly
- [ ] Admin page loading with auth working
- [ ] Basic UI following design system
- [ ] Error handling implemented

---

### SPRINT 2: CRUD Operations (2 weeks)
**🎯 Goal**: Complete collection & item management

**Context essencial:**
```typescript
// Form pattern: app/components/ImageUploadForm.tsx
// Modal pattern: app/components/ui/ConfirmationModal.tsx  
// File upload: lib/imageUtils.ts
```

**Key Implementation Files:**

**CollectionForm.tsx** (Baseado em ImageUploadForm pattern):
```typescript
// app/components/Collections/CollectionForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { CRESOL_UI_CONFIG } from '@/lib/design-tokens/ui-config';
import { StandardizedButton } from '@/app/components/admin';

interface CollectionFormProps {
  initialData?: Partial<Collection>;
  onSave: () => void;
  onCancel: () => void;
}

export default function CollectionForm({ initialData, onSave, onCancel }: CollectionFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    cover_image_url: initialData?.cover_image_url || '',
    is_active: initialData?.is_active ?? true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = initialData?.id ? 'PUT' : 'POST';
      const url = initialData?.id 
        ? `/api/admin/collections/${initialData.id}`
        : '/api/admin/collections';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar coleção');
      }

      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${CRESOL_UI_CONFIG.card.base} ${CRESOL_UI_CONFIG.card.padding.md} mb-6`}>
      <h3 className="text-lg font-semibold mb-4">
        {initialData?.id ? 'Editar Coleção' : 'Nova Coleção'}
      </h3>
      
      <form onSubmit={handleSubmit} className={CRESOL_UI_CONFIG.form.container}>
        <div>
          <label className={CRESOL_UI_CONFIG.input.label.required}>
            Nome da Coleção
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`${CRESOL_UI_CONFIG.input.base} ${CRESOL_UI_CONFIG.input.states.default}`}
            required
          />
        </div>

        <div>
          <label className={CRESOL_UI_CONFIG.input.label.default}>
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`${CRESOL_UI_CONFIG.input.base} ${CRESOL_UI_CONFIG.input.states.default} min-h-[100px]`}
            placeholder="Descrição opcional da coleção"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            Coleção ativa (visível no portal)
          </label>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className={CRESOL_UI_CONFIG.form.actions.container}>
          <StandardizedButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </StandardizedButton>
          <StandardizedButton
            type="submit"
            variant="primary"
            loading={loading}
          >
            {initialData?.id ? 'Atualizar' : 'Criar'} Coleção
          </StandardizedButton>
        </div>
      </form>
    </div>
  );
}
```

---

### SPRINT 3: Items Management (2 weeks)
**🎯 Goal**: Manage items within collections

**Context essencial:**
```typescript
// Nested CRUD pattern
// File upload from imageUtils.ts
// Drag & drop preparation
```

---

### SPRINT 4: Advanced Features (2 weeks) 
**🎯 Goal**: Drag & drop + search + filtering

---

### SPRINT 5: Performance Optimization (1 week)
**🎯 Goal**: Image optimization + virtualization

---

### SPRINT 6: Testing & Polish (1 week)
**🎯 Goal**: Bug fixes + UX polish

## ⚡ PERFORMANCE OPTIMIZATION GUIDE

### Image Handling (baseado em OptimizedImage.tsx)
```typescript
// Use existing OptimizedImage component
<OptimizedImage
  src={item.image_url}
  alt={item.name}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={80}
  fallbackText="Imagem indisponível"
/>
```

### Database Optimization
```sql
-- Indexes já definidos no schema
-- Batch operations para updates
-- Connection pooling via Supabase
```

### Bundle Size Management
```bash
# Check bundle impact
npm run build
npx @next/bundle-analyzer
```

## 🧪 TESTING STRATEGY

### Integration Tests
```bash
# Test database operations
curl -X GET http://localhost:3000/api/admin/collections

# Test auth
curl -X POST http://localhost:3000/api/admin/collections \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Collection"}'
```

### Manual Test Checklist
- [ ] Admin login and access
- [ ] CRUD operations working
- [ ] Error states handled
- [ ] Loading states working
- [ ] Mobile responsive
- [ ] Image uploads working

## 🚀 DEPLOYMENT CHECKLIST

### Pre-deployment
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] RLS policies tested
- [ ] Admin permissions verified

### Post-deployment
- [ ] API endpoints responding
- [ ] Admin panel accessible
- [ ] File uploads working
- [ ] Performance metrics acceptable

---

**IMPLEMENTAÇÃO PRONTA PARA EXECUÇÃO COM TEMPLATES COPY-PASTE E VALIDATION GATES**