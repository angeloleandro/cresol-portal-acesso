import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';



/**
 * createClient function
 * @todo Add proper documentation
 */
export function CreateClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookies cannot be set in Server Actions or middleware.
            // If you need to set cookies, consider using a Client Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Error removing cookie
          }
        },
      },
    }
  );
} 