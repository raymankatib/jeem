import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const matchSchema = z.object({
	talent_id: z.string().uuid("Invalid talent ID")
});

// ============================================================================
// POST /api/hiring-requests/[id]/match
// Match a talent to a hiring request (admin only)
// ============================================================================

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: requestId } = await params;

		// Verify admin authentication
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();

		if (authError || !user || user.user_metadata?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
		}

		// Parse and validate
		const body = await request.json();
		const validationResult = matchSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid request",
					details: validationResult.error.flatten().fieldErrors
				},
				{ status: 400 }
			);
		}

		const { talent_id } = validationResult.data;
		const supabaseAdmin = getSupabaseAdmin();

		// 1. Verify hiring request exists
		const { data: hiringRequest, error: requestError } = await supabaseAdmin
			.from("hiring_requests")
			.select("id, matched_talent_id, request_title")
			.eq("id", requestId)
			.single();

		if (requestError || !hiringRequest) {
			return NextResponse.json({ error: "Hiring request not found" }, { status: 404 });
		}

		// 2. Check if hiring request is already matched
		if (hiringRequest.matched_talent_id) {
			return NextResponse.json(
				{ error: "This hiring request is already matched to another talent" },
				{ status: 400 }
			);
		}

		// 3. Verify talent exists and has correct status
		const { data: talent, error: talentError } = await supabaseAdmin
			.from("talents")
			.select("id, name, application_status")
			.eq("id", talent_id)
			.single();

		if (talentError || !talent) {
			return NextResponse.json({ error: "Talent not found" }, { status: 404 });
		}

		if (talent.application_status !== "pending_matching") {
			return NextResponse.json(
				{
					error: `Talent must have status 'pending_matching' to be matched. Current status: ${talent.application_status}`
				},
				{ status: 400 }
			);
		}

		// 4. Check if talent is already matched to another request
		const { data: existingMatch, error: matchCheckError } = await supabaseAdmin
			.from("hiring_requests")
			.select("id, request_title")
			.eq("matched_talent_id", talent_id)
			.maybeSingle();

		if (matchCheckError) {
			console.error("Error checking existing match:", matchCheckError);
			return NextResponse.json({ error: "Failed to verify talent availability" }, { status: 500 });
		}

		if (existingMatch) {
			return NextResponse.json(
				{
					error: `This talent is already matched to another hiring request: "${existingMatch.request_title}"`
				},
				{ status: 400 }
			);
		}

		// 5. Perform the match - update hiring request
		const { error: updateRequestError } = await supabaseAdmin
			.from("hiring_requests")
			.update({
				matched_talent_id: talent_id,
				application_status: "matched",
				request_status: "filled",
				matched_at: new Date().toISOString()
			})
			.eq("id", requestId);

		if (updateRequestError) {
			console.error("Error updating hiring request:", updateRequestError);
			return NextResponse.json({ error: "Failed to update hiring request" }, { status: 500 });
		}

		// 6. Update talent status
		const { error: updateTalentError } = await supabaseAdmin
			.from("talents")
			.update({
				application_status: "matched"
			})
			.eq("id", talent_id);

		if (updateTalentError) {
			console.error("Error updating talent:", updateTalentError);
			// Rollback hiring request update
			await supabaseAdmin
				.from("hiring_requests")
				.update({
					matched_talent_id: null,
					matched_at: null,
					application_status: "reviewing_candidates",
					request_status: "open"
				})
				.eq("id", requestId);

			return NextResponse.json({ error: "Failed to update talent status" }, { status: 500 });
		}

		// 7. Fetch updated hiring request with all relations
		const { data: updatedRequest, error: fetchError } = await supabaseAdmin
			.from("hiring_requests")
			.select(
				`
        *,
        companies:company_id (
          id,
          company_name,
          contact_name,
          email
        )
      `
			)
			.eq("id", requestId)
			.single();

		if (fetchError) {
			console.error("Error fetching updated request:", fetchError);
		}

		return NextResponse.json({
			success: true,
			message: `Successfully matched ${talent.name} to hiring request`,
			data: updatedRequest
		});
	} catch (error) {
		console.error("Match error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// ============================================================================
// DELETE /api/hiring-requests/[id]/match
// Unmatch a talent from a hiring request (admin only)
// ============================================================================

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: requestId } = await params;

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

		// 1. Get current hiring request with matched talent
		const { data: hiringRequest, error: requestError } = await supabaseAdmin
			.from("hiring_requests")
			.select("id, matched_talent_id, request_title")
			.eq("id", requestId)
			.single();

		if (requestError || !hiringRequest) {
			return NextResponse.json({ error: "Hiring request not found" }, { status: 404 });
		}

		if (!hiringRequest.matched_talent_id) {
			return NextResponse.json({ error: "This hiring request is not matched to any talent" }, { status: 400 });
		}

		const talentId = hiringRequest.matched_talent_id;

		// 2. Update hiring request - clear match and revert statuses
		const { error: updateRequestError } = await supabaseAdmin
			.from("hiring_requests")
			.update({
				matched_talent_id: null,
				matched_at: null,
				application_status: "reviewing_candidates",
				request_status: "open"
			})
			.eq("id", requestId);

		if (updateRequestError) {
			console.error("Error updating hiring request:", updateRequestError);
			return NextResponse.json({ error: "Failed to unmatch hiring request" }, { status: 500 });
		}

		// 3. Revert talent status to pending_matching
		const { error: updateTalentError } = await supabaseAdmin
			.from("talents")
			.update({
				application_status: "pending_matching"
			})
			.eq("id", talentId);

		if (updateTalentError) {
			console.error("Error updating talent:", updateTalentError);
			// Rollback hiring request update
			await supabaseAdmin
				.from("hiring_requests")
				.update({
					matched_talent_id: talentId,
					matched_at: new Date().toISOString(),
					application_status: "matched",
					request_status: "filled"
				})
				.eq("id", requestId);

			return NextResponse.json({ error: "Failed to update talent status" }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			message: "Successfully unmatched talent from hiring request"
		});
	} catch (error) {
		console.error("Unmatch error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
