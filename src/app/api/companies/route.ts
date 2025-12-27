import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { sendCompanyConfirmationEmail } from "@/lib/email";

// ============================================================================
// RATE LIMITING (Simple in-memory stub)
// ============================================================================
// NOTE: This is a simple in-memory rate limiter for development/demo purposes.
// In production, use a distributed solution like Upstash Redis or similar.

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(ipHash: string): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(ipHash);

	if (!record || now > record.resetAt) {
		rateLimitMap.set(ipHash, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return true;
	}

	if (record.count >= RATE_LIMIT_MAX) {
		return false;
	}

	record.count++;
	return true;
}

// Clean up old entries periodically
setInterval(() => {
	const now = Date.now();
	for (const [key, value] of rateLimitMap.entries()) {
		if (now > value.resetAt) {
			rateLimitMap.delete(key);
		}
	}
}, 5 * 60 * 1000);

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const companySchema = z.object({
	companyName: z.string().min(1, "Company name is required").max(200, "Company name is too long"),
	contactName: z.string().min(1, "Contact name is required").max(200, "Contact name is too long"),
	email: z.string().email("Invalid email address").max(200, "Email is too long"),
	website: z.string().url("Invalid website URL").max(500, "Website URL is too long").optional().or(z.literal("")),
	companySize: z.string().min(1, "Company size is required").max(50, "Company size is too long"),
	rolesNeeded: z.string().min(1, "Roles needed is required").max(500, "Roles needed is too long"),
	projectType: z.string().min(1, "Project type is required").max(50, "Project type is too long"),
	budgetRange: z.string().max(50, "Budget range is too long").optional().default(""),
	projectDescription: z
		.string()
		.min(1, "Project description is required")
		.max(3000, "Project description is too long"),
	// UTM parameters (all optional)
	utm_source: z.string().max(200).optional().default(""),
	utm_medium: z.string().max(200).optional().default(""),
	utm_campaign: z.string().max(200).optional().default(""),
	utm_term: z.string().max(200).optional().default(""),
	utm_content: z.string().max(200).optional().default(""),
	page_path: z.string().max(500).optional().default(""),
	// Language for email
	language: z.enum(["en", "ar"]).optional().default("en"),
	// Honeypot field
	honey: z.string().optional()
});

// ============================================================================
// HELPERS
// ============================================================================

async function hashIP(ip: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(ip + (process.env.IP_HASH_SALT || "jeem-salt-2024"));
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getClientIP(request: NextRequest): string {
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim();
	}

	const realIP = request.headers.get("x-real-ip");
	if (realIP) {
		return realIP;
	}

	return "unknown";
}

// ============================================================================
// POST /api/companies
// ============================================================================

export async function POST(request: NextRequest) {
	try {
		// Parse JSON body
		const body = await request.json();

		// Validate input
		const parseResult = companySchema.safeParse(body);

		if (!parseResult.success) {
			const errors = parseResult.error.flatten().fieldErrors;
			return NextResponse.json(
				{
					ok: false,
					error: "Validation failed",
					details: errors
				},
				{ status: 400 }
			);
		}

		const data = parseResult.data;

		// Honeypot check
		if (data.honey) {
			return NextResponse.json({ ok: true });
		}

		// Get and hash IP
		const clientIP = getClientIP(request);
		const ipHash = await hashIP(clientIP);

		// Rate limit check
		if (!checkRateLimit(ipHash)) {
			return NextResponse.json(
				{
					ok: false,
					error: "Too many requests. Please try again later."
				},
				{ status: 429 }
			);
		}

		// Get user agent
		const userAgent = request.headers.get("user-agent") || "";

		// Get Supabase admin client
		const supabase = getSupabaseAdmin();

		// Insert into database
		const { data: insertedCompany, error: insertError } = await supabase
			.from("companies")
			.insert({
				company_name: data.companyName,
				contact_name: data.contactName,
				email: data.email,
				website: data.website || null,
				company_size: data.companySize,
				roles_needed: data.rolesNeeded,
				project_type: data.projectType,
				budget_range: data.budgetRange || null,
				project_description: data.projectDescription,
				source: "hire-landing",
				utm_source: data.utm_source || null,
				utm_medium: data.utm_medium || null,
				utm_campaign: data.utm_campaign || null,
				utm_term: data.utm_term || null,
				utm_content: data.utm_content || null,
				page_path: data.page_path || null,
				user_agent: userAgent,
				ip_hash: ipHash,
				email_status: "pending"
			})
			.select("id")
			.single();

		if (insertError) {
			console.error("Supabase insert error:", insertError);
			return NextResponse.json(
				{
					ok: false,
					error: "Failed to submit inquiry. Please try again."
				},
				{ status: 500 }
			);
		}

		// Send confirmation email
		const companyId = insertedCompany.id;

		try {
			const emailResult = await sendCompanyConfirmationEmail({
				to: data.email,
				contactName: data.contactName,
				companyName: data.companyName,
				companyId,
				language: data.language || "en"
			});

			// Update email status
			const emailStatus = emailResult.success ? "sent" : "failed";
			const updateData: Record<string, unknown> = {
				email_status: emailStatus
			};

			if (emailResult.success) {
				updateData.email_sent_at = new Date().toISOString();
			} else {
				updateData.email_error = emailResult.error;
			}

			const { error: updateError } = await supabase.from("companies").update(updateData).eq("id", companyId);

			if (updateError) {
				console.error("Failed to update email status:", updateError);
			}

			if (!emailResult.success) {
				console.error(`Failed to send confirmation email to ${data.email}:`, emailResult.error);
			}
		} catch (emailError) {
			console.error("Email sending error:", emailError);

			const { error: updateError } = await supabase
				.from("companies")
				.update({
					email_status: "failed",
					email_error: emailError instanceof Error ? emailError.message : "Unknown error"
				})
				.eq("id", companyId);

			if (updateError) {
				console.error("Failed to update email status after error:", updateError);
			}
		}

		return NextResponse.json({ ok: true }, { status: 201 });
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{
				ok: false,
				error: "An unexpected error occurred. Please try again."
			},
			{ status: 500 }
		);
	}
}



