// This file is server-only - it uses the service role key
import "server-only";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton instance to avoid creating multiple clients
let supabaseAdmin: SupabaseClient | null = null;

/**
 * Returns a Supabase client with admin/service role privileges.
 * This should ONLY be used on the server side (API routes, server components).
 * Never expose the service role key to the client.
 */
export function getSupabaseAdmin(): SupabaseClient {
	if (supabaseAdmin) {
		return supabaseAdmin;
	}

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
	}

	if (!supabaseServiceRoleKey) {
		throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
	}

	supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});

	return supabaseAdmin;
}




