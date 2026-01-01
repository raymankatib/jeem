import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

// ============================================================================
// GET /api/talents/available
// Get list of talents available for matching (admin only)
// Returns talents with status "pending_matching" that are not currently matched
// ============================================================================

export async function GET(request: NextRequest) {
	try {
		// Verify admin authentication
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();

		if (authError || !user || user.user_metadata?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
		}

		const supabaseAdmin = getSupabaseAdmin();

		// 1. Get all talents with status "pending_matching"
		const { data: talents, error: talentsError } = await supabaseAdmin
			.from("talents")
			.select("id, name, email, role, english_level, tools, portfolio, created_at")
			.eq("application_status", "pending_matching")
			.order("created_at", { ascending: false });

		if (talentsError) {
			console.error("Error fetching talents:", talentsError);
			return NextResponse.json({ error: "Failed to fetch talents" }, { status: 500 });
		}

		if (!talents || talents.length === 0) {
			return NextResponse.json({ success: true, data: [] });
		}

		// 2. Get all talent IDs that are currently matched
		const { data: matchedRequests, error: matchedError } = await supabaseAdmin
			.from("hiring_requests")
			.select("matched_talent_id")
			.not("matched_talent_id", "is", null);

		if (matchedError) {
			console.error("Error fetching matched talents:", matchedError);
			return NextResponse.json({ error: "Failed to verify talent availability" }, { status: 500 });
		}

		// 3. Create a set of matched talent IDs for quick lookup
		const matchedTalentIds = new Set(matchedRequests?.map((r) => r.matched_talent_id) || []);

		// 4. Filter out talents that are already matched
		const availableTalents = talents.filter((talent) => !matchedTalentIds.has(talent.id));

		return NextResponse.json({
			success: true,
			data: availableTalents,
			count: availableTalents.length
		});
	} catch (error) {
		console.error("Available talents error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
