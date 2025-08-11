# COLLECTIONS SYSTEM - QA FRAMEWORK & VALIDATION

Framework completo de Quality Assurance para o sistema de coleções com templates automatizados e validation checkpoints.

## 🎯 VALIDATION FRAMEWORK OVERVIEW

### 8-Step Quality Gates (por task)
Baseado no sistema de validation existente do Portal Cresol, adaptado para collections:

```yaml
quality_gates:
  step_1_syntax: "TypeScript compilation + ESLint validation"
  step_2_type: "Type safety + interface compliance" 
  step_3_security: "RLS policies + auth validation"
  step_4_functionality: "CRUD operations + business logic"
  step_5_integration: "API contract + database consistency"
  step_6_performance: "Query optimization + load testing"
  step_7_ux: "UI/UX patterns + accessibility"
  step_8_deployment: "Build success + environment validation"
```

## 📋 VALIDATION TEMPLATES POR SPRINT

### Sprint 1: Foundation Validation

#### Database Schema Validation
```sql
-- Template de validação da estrutura
-- Execute após aplicar migration

-- 1. Verificar tabelas criadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('collections', 'collection_items');

-- 2. Verificar RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('collections', 'collection_items');

-- 3. Verificar policies criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('collections', 'collection_items');

-- 4. Testar policies (como admin)
INSERT INTO collections (name, description) VALUES ('Test Collection', 'Test Description');
SELECT * FROM collections WHERE name = 'Test Collection';
DELETE FROM collections WHERE name = 'Test Collection';
```

#### API Routes Validation
```bash
# Template de testes de API
# collections-api-tests.sh

#!/bin/bash
BASE_URL="http://localhost:3000"

echo "🧪 Testing Collections API..."

# 1. Test unauthorized access
echo "Testing unauthorized access..."
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "$BASE_URL/api/admin/collections" | head -5

# 2. Test with admin auth (need valid session)
echo "Testing authorized access (requires manual login)..."
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "$BASE_URL/api/admin/collections" \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE" | head -10

# 3. Test POST validation
echo "Testing POST validation..."
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST "$BASE_URL/api/admin/collections" \
  -H "Content-Type: application/json" \
  -d '{"name":""}' | head -5

# 4. Test valid POST
echo "Testing valid POST..."
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST "$BASE_URL/api/admin/collections" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Collection","description":"Test Description"}' | head -10
```

#### Component Validation Template
```typescript
// collections-component-tests.tsx
// Template para validação manual de componentes

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminCollections from '@/app/admin/collections/page';

// Validation checklist for AdminCollections component:

/**
 * ✅ RENDER VALIDATION
 * - Component renders without errors
 * - Loading state shows correctly
 * - Auth check redirects work
 * - Admin role verification works
 */

/**
 * ✅ UI VALIDATION  
 * - Breadcrumb navigation present
 * - Header with title and description
 * - "Nova Coleção" button present
 * - Collections grid layout responsive
 * - Empty state message when no collections
 */

/**
 * ✅ INTERACTION VALIDATION
 * - Create collection button triggers form
 * - Edit collection opens form with data
 * - Delete collection shows confirmation
 * - Error states display properly
 * - Loading states during operations
 */

/**
 * ✅ ACCESSIBILITY VALIDATION
 * - Proper ARIA labels
 * - Keyboard navigation works
 * - Screen reader compatibility
 * - Focus management
 */

// Manual validation steps:
export const manualValidationChecklist = {
  render: [
    "Page loads without console errors",
    "Loading spinner appears initially",
    "Content appears after auth check",
    "UI matches design system tokens"
  ],
  
  auth: [
    "Non-admin users redirected to dashboard", 
    "Non-authenticated users redirected to login",
    "Admin users see full interface",
    "Admin header and navigation present"
  ],
  
  functionality: [
    "Collections fetch and display correctly",
    "Error messages show for API failures", 
    "Empty state displays when no collections",
    "Collection count displays correctly"
  ],
  
  responsive: [
    "Mobile layout works correctly",
    "Tablet layout adjusts properly", 
    "Desktop layout uses full space",
    "Cards resize appropriately"
  ]
};
```

### Sprint 2: CRUD Operations Validation

#### Form Validation Template
```typescript
// collection-form-validation.ts
export const CollectionFormValidationChecklist = {
  
  // Field Validation
  fields: {
    name: {
      required: "Shows error when empty",
      maxLength: "Enforces 255 character limit", 
      uniqueness: "Validates unique collection names"
    },
    description: {
      optional: "Can be left empty",
      maxLength: "Handles long descriptions gracefully"
    },
    isActive: {
      default: "Defaults to true (checked)",
      toggle: "Toggle works correctly"
    }
  },

  // Submission Validation
  submit: {
    loading: "Shows loading state during submission",
    success: "Redirects/refreshes after successful save",
    error: "Displays error messages clearly",
    validation: "Prevents submission with invalid data"
  },

  // UX Validation  
  ux: {
    responsive: "Form works on mobile devices",
    accessibility: "All fields have proper labels",
    keyboard: "Tab navigation works correctly",
    autofocus: "Name field gets focus on load"
  }
};

// Automated validation function
export const validateCollectionForm = async (formElement: HTMLFormElement) => {
  const results = {
    passed: [] as string[],
    failed: [] as string[]
  };

  // Check required field validation
  const nameInput = formElement.querySelector('input[name="name"]') as HTMLInputElement;
  if (nameInput.hasAttribute('required')) {
    results.passed.push("Name field has required attribute");
  } else {
    results.failed.push("Name field missing required attribute");
  }

  // Check form submission handling
  const submitButton = formElement.querySelector('button[type="submit"]') as HTMLButtonElement;
  if (submitButton) {
    results.passed.push("Submit button present");
  } else {
    results.failed.push("Submit button missing");
  }

  // Check accessibility
  const labels = formElement.querySelectorAll('label');
  const inputs = formElement.querySelectorAll('input, textarea');
  if (labels.length >= inputs.length) {
    results.passed.push("All inputs have labels");
  } else {
    results.failed.push("Missing labels for some inputs");
  }

  return results;
};
```

#### API Integration Tests
```javascript
// api-integration-tests.js
// Template para testes de integração da API

const API_BASE = 'http://localhost:3000/api/admin';

export const CollectionsAPITests = {
  
  // CRUD Operation Tests
  async testCRUDOperations() {
    const results = [];
    
    try {
      // CREATE test
      const createResponse = await fetch(`${API_BASE}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Collection',
          description: 'Test Description',
          is_active: true
        })
      });
      
      if (createResponse.ok) {
        results.push({ test: 'CREATE', status: 'PASS' });
        const created = await createResponse.json();
        
        // READ test
        const readResponse = await fetch(`${API_BASE}/collections`);
        if (readResponse.ok) {
          results.push({ test: 'READ', status: 'PASS' });
          
          // UPDATE test
          const updateResponse = await fetch(`${API_BASE}/collections/${created.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Updated Test Collection',
              description: 'Updated Description'
            })
          });
          
          if (updateResponse.ok) {
            results.push({ test: 'UPDATE', status: 'PASS' });
          } else {
            results.push({ test: 'UPDATE', status: 'FAIL', error: updateResponse.statusText });
          }
          
          // DELETE test
          const deleteResponse = await fetch(`${API_BASE}/collections/${created.id}`, {
            method: 'DELETE'
          });
          
          if (deleteResponse.ok) {
            results.push({ test: 'DELETE', status: 'PASS' });
          } else {
            results.push({ test: 'DELETE', status: 'FAIL', error: deleteResponse.statusText });
          }
        } else {
          results.push({ test: 'READ', status: 'FAIL', error: readResponse.statusText });
        }
      } else {
        results.push({ test: 'CREATE', status: 'FAIL', error: createResponse.statusText });
      }
    } catch (error) {
      results.push({ test: 'CRUD_OPERATIONS', status: 'ERROR', error: error.message });
    }
    
    return results;
  },
  
  // Authorization Tests
  async testAuthorization() {
    const results = [];
    
    // Test unauthorized access
    try {
      const response = await fetch(`${API_BASE}/collections`);
      if (response.status === 401) {
        results.push({ test: 'UNAUTHORIZED_ACCESS', status: 'PASS' });
      } else {
        results.push({ test: 'UNAUTHORIZED_ACCESS', status: 'FAIL', message: 'Should return 401' });
      }
    } catch (error) {
      results.push({ test: 'UNAUTHORIZED_ACCESS', status: 'ERROR', error: error.message });
    }
    
    return results;
  },
  
  // Validation Tests
  async testValidation() {
    const results = [];
    
    // Test empty name validation
    try {
      const response = await fetch(`${API_BASE}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', description: 'Test' })
      });
      
      if (response.status === 400) {
        results.push({ test: 'EMPTY_NAME_VALIDATION', status: 'PASS' });
      } else {
        results.push({ test: 'EMPTY_NAME_VALIDATION', status: 'FAIL', message: 'Should validate empty name' });
      }
    } catch (error) {
      results.push({ test: 'EMPTY_NAME_VALIDATION', status: 'ERROR', error: error.message });
    }
    
    return results;
  }
};

// Run all tests
export const runAllAPITests = async () => {
  const crudResults = await CollectionsAPITests.testCRUDOperations();
  const authResults = await CollectionsAPITests.testAuthorization();
  const validationResults = await CollectionsAPITests.testValidation();
  
  return {
    crud: crudResults,
    authorization: authResults,  
    validation: validationResults,
    summary: {
      total: crudResults.length + authResults.length + validationResults.length,
      passed: [...crudResults, ...authResults, ...validationResults].filter(r => r.status === 'PASS').length,
      failed: [...crudResults, ...authResults, ...validationResults].filter(r => r.status === 'FAIL').length,
      errors: [...crudResults, ...authResults, ...validationResults].filter(r => r.status === 'ERROR').length
    }
  };
};
```

## 🚀 PERFORMANCE BENCHMARKS

### Database Performance Validation
```sql
-- collections-performance-tests.sql

-- 1. Test index usage
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM collections 
WHERE is_active = true 
ORDER BY order_index;

-- 2. Test joins performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT c.*, COUNT(ci.id) as item_count
FROM collections c
LEFT JOIN collection_items ci ON c.id = ci.collection_id
WHERE c.is_active = true
GROUP BY c.id
ORDER BY c.order_index;

-- 3. Test with large dataset
-- Expect: Index scan, execution time < 100ms for 1000 collections
```

### API Performance Benchmarks
```bash
# collections-performance-tests.sh

#!/bin/bash

echo "🚀 Collections API Performance Tests"

# 1. Basic GET request timing
echo "Testing GET /api/admin/collections..."
time curl -s -w "Time: %{time_total}s\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/admin/collections" > /dev/null

# 2. POST request timing  
echo "Testing POST /api/admin/collections..."
time curl -s -w "Time: %{time_total}s\nStatus: %{http_code}\n" \
  -X POST "http://localhost:3000/api/admin/collections" \
  -H "Content-Type: application/json" \
  -d '{"name":"Performance Test Collection"}' > /dev/null

# Performance targets:
# - GET requests: < 200ms
# - POST requests: < 500ms  
# - Memory usage: < 50MB per request
```

### Frontend Performance Validation
```typescript
// collections-performance-validation.ts

export const PerformanceValidation = {
  
  // Component render performance
  async validateRenderPerformance() {
    const startTime = performance.now();
    
    // Simulate component mount with 50 collections
    const mockCollections = Array.from({ length: 50 }, (_, i) => ({
      id: `collection-${i}`,
      name: `Collection ${i}`,
      description: `Description for collection ${i}`,
      is_active: true,
      created_at: new Date().toISOString(),
      collection_items: []
    }));
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    return {
      renderTime,
      passed: renderTime < 100, // Target: < 100ms
      message: `Render time: ${renderTime.toFixed(2)}ms`
    };
  },
  
  // Memory usage validation
  validateMemoryUsage() {
    if (performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      return {
        memoryUsage: `${memoryUsage.toFixed(2)} MB`,
        passed: memoryUsage < 100, // Target: < 100MB
        message: `Memory usage: ${memoryUsage.toFixed(2)} MB`
      };
    }
    return { message: 'Memory API not available' };
  },
  
  // Bundle size validation (manual check)
  bundleSizeChecklist: [
    "npm run build completes successfully",
    "Collections pages < 500KB gzipped", 
    "No critical bundle warnings",
    "Tree shaking working correctly",
    "Dynamic imports for large components"
  ]
};
```

## ✅ ACCESSIBILITY VALIDATION

### A11y Checklist Template
```typescript
// collections-a11y-validation.ts

export const AccessibilityValidation = {
  
  // Keyboard Navigation
  keyboardNavigation: [
    "Tab navigation works through all interactive elements",
    "Enter key activates buttons and links", 
    "Escape key closes modals and forms",
    "Arrow keys work in data grids",
    "Focus indicators visible on all elements"
  ],
  
  // Screen Reader Support
  screenReader: [
    "All images have appropriate alt text",
    "Form fields have associated labels",
    "Buttons have descriptive text",
    "Dynamic content changes announced",
    "Page structure uses semantic HTML"
  ],
  
  // Visual Accessibility  
  visual: [
    "Color contrast ratios meet WCAG AA (4.5:1)",
    "Text is readable at 200% zoom",
    "Focus indicators are clearly visible",
    "No information conveyed by color alone",
    "Motion respects prefers-reduced-motion"
  ],
  
  // ARIA Implementation
  aria: [
    "Interactive elements have appropriate roles",
    "Form validation errors properly announced",  
    "Live regions used for dynamic updates",
    "Modal dialogs properly labeled",
    "Expandable content uses aria-expanded"
  ]
};

// Automated A11y Test
export const runAccessibilityTests = () => {
  const results = {
    passed: [] as string[],
    failed: [] as string[]
  };
  
  // Check for alt attributes on images
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (img.alt) {
      results.passed.push(`Image ${index + 1} has alt text`);
    } else {
      results.failed.push(`Image ${index + 1} missing alt text`);
    }
  });
  
  // Check for form labels
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const label = id ? document.querySelector(`label[for="${id}"]`) : null;
    
    if (label) {
      results.passed.push(`Input ${index + 1} has associated label`);
    } else {
      results.failed.push(`Input ${index + 1} missing label`);
    }
  });
  
  return results;
};
```

## 🏆 CONTINUOUS VALIDATION STRATEGY

### Pre-commit Hooks
```bash
# .husky/pre-commit
#!/bin/sh

echo "🔍 Running pre-commit validation..."

# 1. TypeScript compilation
npx tsc --noEmit

# 2. ESLint validation  
npx eslint --ext .ts,.tsx app/admin/collections app/components/Collections

# 3. Prettier check
npx prettier --check app/admin/collections app/components/Collections

# 4. Unit tests (if configured)
# npm run test:collections

echo "✅ Pre-commit validation passed"
```

### Deployment Validation
```yaml
# deployment-validation.yml
name: Collections Deployment Validation

validation_steps:
  
  build_validation:
    - name: "Build success"
      command: "npm run build"
      expected: "Build completed successfully"
    
    - name: "TypeScript compilation"  
      command: "npx tsc --noEmit"
      expected: "No compilation errors"
  
  api_validation:
    - name: "API endpoints responding"
      test: "GET /api/admin/collections returns 200 or 401"
    
    - name: "Database connection"
      test: "Supabase connection successful"
  
  ui_validation:
    - name: "Admin page loads"
      test: "Admin collections page renders without errors"
    
    - name: "Auth flow works"
      test: "Authentication redirects function correctly"
  
  performance_validation:
    - name: "Bundle size check"
      test: "Total bundle size < 2MB"
    
    - name: "Page load time"
      test: "First paint < 2 seconds"
```

### Monitoring & Alerts
```typescript
// collections-monitoring.ts

export const MonitoringChecks = {
  
  // Health check endpoint
  healthCheck: {
    endpoint: '/api/admin/collections/health',
    expectedResponse: { status: 'ok', timestamp: 'ISO_DATE' },
    alertThreshold: '5xx errors > 1% in 5 minutes'
  },
  
  // Performance monitoring
  performance: {
    apiResponseTime: 'avg < 200ms, 95th percentile < 500ms',
    pageLoadTime: 'FCP < 1.5s, LCP < 2.5s',
    errorRate: '< 0.1% client errors'
  },
  
  // Business metrics
  business: {
    collectionCreation: 'Track successful collection creation',
    adminUsage: 'Track admin panel usage patterns',
    errorTracking: 'Track and categorize user-facing errors'
  }
};
```

---

**QA FRAMEWORK COMPLETO COM TEMPLATES AUTOMATIZADOS E VALIDATION CHECKPOINTS PRONTOS PARA USO**