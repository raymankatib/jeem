import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { sendCustomTalentEmail } from "@/lib/email";
import { z } from "zod";

const sendEmailSchema = z.object({
	subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
	body: z.string().min(1, "Body is required").max(50000, "Body too long")
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Await params (Next.js 15 requirement)
		const { id: talentId } = await params;

		// Verify admin authentication
		const supabase = await createServerSupabaseClient();
		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if user is admin
		if (user.user_metadata?.role !== 'admin') {
			return NextResponse.json(
				{ error: "Forbidden - Admin access required" },
				{ status: 403 }
			);
		}

		// Parse and validate request body
		const body = await request.json();
		const validationResult = sendEmailSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid email data",
					details: validationResult.error.flatten().fieldErrors
				},
				{ status: 400 }
			);
		}

		const { subject, body: emailBody } = validationResult.data;

		// Get talent details using admin client
		const supabaseAdmin = getSupabaseAdmin();
		const { data: talent, error: talentError } = await supabaseAdmin
			.from("talents")
			.select("id, name, email")
			.eq("id", talentId)
			.single();

		if (talentError || !talent) {
			console.error("Error fetching talent:", talentError);
			return NextResponse.json(
				{ error: "Talent not found" },
				{ status: 404 }
			);
		}

		// Send email using Resend
		const emailResult = await sendCustomTalentEmail({
			to: talent.email,
			name: talent.name,
			talentId: talent.id,
			subject: subject,
			body: emailBody
		});

		if (!emailResult.success) {
			console.error("Failed to send email:", emailResult.error);
			return NextResponse.json(
				{ error: "Failed to send email", details: emailResult.error },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Email sent successfully"
		});
	} catch (error) {
		console.error("Send email error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
