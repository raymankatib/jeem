import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const statusSchema = z.object({
	application_status: z
		.enum(["under_review", "reviewing_candidates", "interviewing_candidates", "negotiating", "matched", "rejected"])
		.optional(),
	request_status: z.enum(["open", "filled", "cancelled"]).optional()
});

// ============================================================================
// PATCH /api/hiring-requests/[id]/status
// Update hiring request status (admin only)
// ============================================================================

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
		const validationResult = statusSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid status",
					details: validationResult.error.flatten().fieldErrors
				},
				{ status: 400 }
			);
		}

		const { application_status, request_status } = validationResult.data;

		// At least one status must be provided
		if (!application_status && !request_status) {
			return NextResponse.json({ error: "At least one status field is required" }, { status: 400 });
		}

		// Build update data
		const updateData: Record<string, unknown> = {};
		if (application_status) {
			updateData.application_status = application_status;
		}
		if (request_status) {
			updateData.request_status = request_status;
		}

		// Update status
		const supabaseAdmin = getSupabaseAdmin();
		const { data, error } = await supabaseAdmin
			.from("hiring_requests")
			.update(updateData)
			.eq("id", requestId)
			.select(
				`
        *,
        companies:company_id (
          company_name,
          contact_name,
          email
        )
      `
			)
			.single();

		if (error) {
			console.error("Error updating hiring request status:", error);
			return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
		}

		// TODO: Send email notification about status change
		// This can be implemented similar to existing company/talent status update emails

		return NextResponse.json({ success: true, data });
	} catch (error) {
		console.error("Status update error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
