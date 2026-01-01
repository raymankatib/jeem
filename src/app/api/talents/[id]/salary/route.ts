import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const salarySchema = z.object({
	salary: z.number().nullable()
});

// ============================================================================
// PATCH /api/talents/[id]/salary
// Update talent salary (admin only)
// ============================================================================

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: talentId } = await params;

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
		const validationResult = salarySchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid salary value",
					details: validationResult.error.flatten().fieldErrors
				},
				{ status: 400 }
			);
		}

		const { salary } = validationResult.data;

		// Update salary
		const supabaseAdmin = getSupabaseAdmin();
		const { data, error } = await supabaseAdmin
			.from("talents")
			.update({ salary })
			.eq("id", talentId)
			.select("id, name, salary")
			.single();

		if (error) {
			console.error("Error updating talent salary:", error);
			return NextResponse.json({ error: "Failed to update salary" }, { status: 500 });
		}

		if (!data) {
			return NextResponse.json({ error: "Talent not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, data });
	} catch (error) {
		console.error("Salary update error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
