import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { sendConfirmationEmail } from "@/lib/email";

// ============================================================================
// RATE LIMITING (Simple in-memory stub)
// ============================================================================
// NOTE: This is a simple in-memory rate limiter for development/demo purposes.
// In production, use a distributed solution like Upstash Redis or similar
// to handle rate limiting across multiple server instances.

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window

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

// Clean up old entries periodically (every 5 minutes)
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

const talentSchema = z.object({
	name: z.string().min(1, "Name is required").max(200, "Name is too long"),
	email: z.string().email("Invalid email address").max(200, "Email is too long"),
	role: z.string().min(1, "Role is required").max(200, "Role is too long"),
	englishLevel: z.string().min(1, "English level is required").max(50, "English level is too long"),
	portfolio: z.string().url("Invalid portfolio URL").max(500, "Portfolio URL is too long"),
	shipped: z.string().min(1, "Please describe what you've shipped").max(2000, "Description is too long"),
	tools: z.string().max(500, "Tools list is too long").optional().default(""),
	// UTM parameters (all optional)
	utm_source: z.string().max(200).optional().default(""),
	utm_medium: z.string().max(200).optional().default(""),
	utm_campaign: z.string().max(200).optional().default(""),
	utm_term: z.string().max(200).optional().default(""),
	utm_content: z.string().max(200).optional().default(""),
	page_path: z.string().max(500).optional().default(""),
	// Language for email (en or ar)
	language: z.enum(["en", "ar"]).optional().default("en"),
	// Honeypot field (should be empty)
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
	// Try various headers that might contain the real IP
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) {
		// x-forwarded-for can contain multiple IPs, take the first one
		return forwardedFor.split(",")[0].trim();
	}

	const realIP = request.headers.get("x-real-ip");
	if (realIP) {
		return realIP;
	}

	// Fallback - in development this might be "::1" or "127.0.0.1"
	return "unknown";
}

// ============================================================================
// POST /api/talents
// ============================================================================

export async function POST(request: NextRequest) {
	try {
		// Parse JSON body
		const body = await request.json();

		// Validate input
		const parseResult = talentSchema.safeParse(body);

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

		// Honeypot check - if filled, it's likely a bot
		// Return success to not reveal the honeypot
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

		// Insert into database and return the inserted row
		const { data: insertedTalent, error: insertError } = await supabase
			.from("talents")
			.insert({
				name: data.name,
				email: data.email,
				role: data.role,
				english_level: data.englishLevel,
				portfolio: data.portfolio,
				shipped: data.shipped,
				tools: data.tools || null,
				source: "landing",
				utm_source: data.utm_source || null,
				utm_medium: data.utm_medium || null,
				utm_campaign: data.utm_campaign || null,
				utm_term: data.utm_term || null,
				utm_content: data.utm_content || null,
				page_path: data.page_path || null,
				user_agent: userAgent,
				ip_hash: ipHash,
				email_status: "pending" // Track email status
			})
			.select("id")
			.single();

		if (insertError) {
			console.error("Supabase insert error:", insertError);
			return NextResponse.json(
				{
					ok: false,
					error: "Failed to submit application. Please try again."
				},
				{ status: 500 }
			);
		}

		// Send confirmation email (don't fail the request if email fails)
		const talentId = insertedTalent.id;

		try {
			const emailResult = await sendConfirmationEmail({
				to: data.email,
				name: data.name,
				role: data.role,
				talentId,
				language: data.language || "en"
			});

			// Update email status in database
			const emailStatus = emailResult.success ? "sent" : "failed";
			const updateData: Record<string, unknown> = {
				email_status: emailStatus
			};

			if (emailResult.success) {
				updateData.email_sent_at = new Date().toISOString();
			} else {
				updateData.email_error = emailResult.error;
			}

			const { error: updateError } = await supabase.from("talents").update(updateData).eq("id", talentId);

			if (updateError) {
				console.error("Failed to update email status:", updateError);
			}

			if (!emailResult.success) {
				console.error(`Failed to send confirmation email to ${data.email}:`, emailResult.error);
			}
		} catch (emailError) {
			// Log error but don't fail the request
			console.error("Email sending error:", emailError);

			// Mark as failed in database
			const { error: updateError } = await supabase
				.from("talents")
				.update({
					email_status: "failed",
					email_error: emailError instanceof Error ? emailError.message : "Unknown error"
				})
				.eq("id", talentId);

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
