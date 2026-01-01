import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const hiringRequestSchema = z.object({
	company_id: z.string().uuid("Invalid company ID"),
	request_title: z.string().min(1, "Request title is required").max(200, "Title too long"),
	roles_needed: z.string().min(1, "Role is required").max(500, "Role description too long"),
	project_type: z.string().min(1, "Project type is required").max(50, "Project type too long"),
	budget_range: z.string().max(50, "Budget range too long").optional().default(""),
	project_description: z
		.string()
		.min(1, "Description is required")
		.max(3000, "Description too long")
});

// ============================================================================
// POST /api/hiring-requests
// Create a new hiring request
// ============================================================================

export async function POST(request: NextRequest) {
	try {
		// Authenticate user
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse and validate request body
		const body = await request.json();
		const validationResult = hiringRequestSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validationResult.error.flatten().fieldErrors
				},
				{ status: 400 }
			);
		}

		const data = validationResult.data;

		// Verify user owns the company
		const supabaseAdmin = getSupabaseAdmin();
		const { data: company, error: companyError } = await supabaseAdmin
			.from("companies")
			.select("id, user_id")
			.eq("id", data.company_id)
			.single();

		if (companyError || !company || company.user_id !== user.id) {
			return NextResponse.json({ error: "Company not found or unauthorized" }, { status: 403 });
		}

		// Create hiring request
		const { data: hiringRequest, error: insertError } = await supabaseAdmin
			.from("hiring_requests")
			.insert({
				company_id: data.company_id,
				request_title: data.request_title,
				roles_needed: data.roles_needed,
				project_type: data.project_type,
				budget_range: data.budget_range || null,
				project_description: data.project_description,
				request_status: "open",
				application_status: "under_review"
			})
			.select()
			.single();

		if (insertError) {
			console.error("Error creating hiring request:", insertError);
			return NextResponse.json({ error: "Failed to create hiring request" }, { status: 500 });
		}

		return NextResponse.json({ success: true, data: hiringRequest }, { status: 201 });
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// ============================================================================
// GET /api/hiring-requests
// List hiring requests (filtered by company_id or all for admins)
// ============================================================================

export async function GET(request: NextRequest) {
	try {
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const companyId = searchParams.get("company_id");

		const supabaseAdmin = getSupabaseAdmin();

		// If user is admin, can see all hiring requests
		if (user.user_metadata?.role === "admin") {
			let query = supabaseAdmin
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
				.order("created_at", { ascending: false });

			if (companyId) {
				query = query.eq("company_id", companyId);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching hiring requests:", error);
				return NextResponse.json({ error: "Failed to fetch hiring requests" }, { status: 500 });
			}

			return NextResponse.json({ success: true, data });
		}

		// Regular users can only see their own company's requests
		// First get the company owned by this user
		const { data: companies } = await supabaseAdmin
			.from("companies")
			.select("id")
			.eq("user_id", user.id);

		if (!companies || companies.length === 0) {
			return NextResponse.json({ success: true, data: [] });
		}

		const userCompanyIds = companies.map((c) => c.id);

		const { data, error } = await supabaseAdmin
			.from("hiring_requests")
			.select("*")
			.in("company_id", userCompanyIds)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching hiring requests:", error);
			return NextResponse.json({ error: "Failed to fetch hiring requests" }, { status: 500 });
		}

		return NextResponse.json({ success: true, data });
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
