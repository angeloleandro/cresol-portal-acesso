// Declaração de tipos para Deno
declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
  }
  
  const env: Env;
  
  function serve(handler: (req: Request) => Promise<Response>): void;
}

// Declarações para supabase-js no ambiente Deno
declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
} 