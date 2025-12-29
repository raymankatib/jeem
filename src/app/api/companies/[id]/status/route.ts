import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { sendCompanyStatusUpdateEmail } from "@/lib/email";
import { z } from "zod";

const companyStatusSchema = z.object({
  application_status: z.enum(['under_review', 'reviewing_candidates', 'interviewing_candidates', 'negotiating', 'matched', 'rejected'])
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id: companyId } = await params;

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
    const validationResult = companyStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid status",
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { application_status } = validationResult.data;

    // Update status using admin client
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("companies")
      .update({ application_status })
      .eq("id", companyId)
      .select()
      .single();

    if (error) {
      console.error("Error updating company status:", error);
      return NextResponse.json(
        { error: "Failed to update status" },
        { status: 500 }
      );
    }

    // Send status update email (fire and forget - don't block the response)
    if (data) {
      sendCompanyStatusUpdateEmail({
        to: data.email,
        companyName: data.company_name,
        contactName: data.contact_name,
        companyId: data.id,
        newStatus: application_status,
        language: "en" // Default to English
      }).catch(err => console.error("Failed to send status email:", err));
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
