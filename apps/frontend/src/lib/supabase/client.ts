import { createBrowserClient } from '@supabase/ssr';

/**
 * A Supabase client for use in Client Components.
 * Uses the anonymous public key (safe to expose in the browser).
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}
