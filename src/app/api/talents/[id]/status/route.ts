import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { sendTalentStatusUpdateEmail } from "@/lib/email";
import { z } from "zod";

const talentStatusSchema = z.object({
  application_status: z.enum(['under_review', 'screening', 'interviewing', 'training', 'pending_matching', 'matched', 'rejected'])
});

export async function PATCH(
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
    const validationResult = talentStatusSchema.safeParse(body);

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
      .from("talents")
      .update({ application_status })
      .eq("id", talentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating talent status:", error);
      return NextResponse.json(
        { error: "Failed to update status" },
        { status: 500 }
      );
    }

    // Send status update email (fire and forget - don't block the response)
    // Skip sending email for 'screening' status as it's an internal step
    if (data && application_status !== 'screening') {
      sendTalentStatusUpdateEmail({
        to: data.email,
        name: data.name,
        role: data.role,
        talentId: data.id,
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
