import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import DashboardClient from "./DashboardClient";

export default async function UserDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // If user is admin, redirect to admin dashboard
  if (user.user_metadata?.role === 'admin') {
    redirect("/admin/dashboard");
  }

  // Fetch user's profile data from talents or companies table
  const supabaseAdmin = getSupabaseAdmin();

  // Try to find user in talents table first
  const { data: talentProfile } = await supabaseAdmin
    .from("talents")
    .select("*")
    .eq("email", user.email)
    .single();

  // If not in talents, try companies table
  const { data: companyProfile } = await supabaseAdmin
    .from("companies")
    .select("*")
    .eq("email", user.email)
    .single();

  // Generate signed URL for CV if user is a talent with CV
  let talentWithSignedUrl = talentProfile;
  if (talentProfile && talentProfile.cv_url) {
    try {
      const urlMatch = talentProfile.cv_url.match(/\/talent-cvs\/(.+)$/);
      if (urlMatch && urlMatch[1]) {
        const storagePath = urlMatch[1];
        const { data: signedUrlData } = await supabaseAdmin.storage
          .from('talent-cvs')
          .createSignedUrl(storagePath, 3600);

        if (signedUrlData?.signedUrl) {
          talentWithSignedUrl = { ...talentProfile, cv_url: signedUrlData.signedUrl };
        }
      }
    } catch (error) {
      console.error('Error generating signed URL for CV:', error);
    }
  }

  return (
    <DashboardClient
      user={user}
      talentProfile={talentWithSignedUrl}
      companyProfile={companyProfile}
    />
  );
}
