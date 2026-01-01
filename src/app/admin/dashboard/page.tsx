import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  // Check if user is an admin
  if (user.user_metadata?.role !== 'admin') {
    redirect("/");
  }

  // Fetch talents and companies data
  const supabaseAdmin = getSupabaseAdmin();

  const { data: talents, error: talentsError } = await supabaseAdmin
    .from("talents")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: companies, error: companiesError } = await supabaseAdmin
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch hiring requests with company info
  const { data: hiringRequests, error: hiringRequestsError } = await supabaseAdmin
    .from("hiring_requests")
    .select(`
      *,
      companies:company_id (
        id,
        company_name,
        contact_name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  // Generate signed URLs for CV files (bucket is private)
  const talentsWithSignedUrls = await Promise.all(
    (talents || []).map(async (talent) => {
      if (talent.cv_url) {
        try {
          // Extract storage path from the public URL
          // Format: https://[project].supabase.co/storage/v1/object/public/talent-cvs/[path]
          const urlMatch = talent.cv_url.match(/\/talent-cvs\/(.+)$/);
          if (urlMatch && urlMatch[1]) {
            const storagePath = urlMatch[1];

            // Generate signed URL (expires in 1 hour)
            const { data: signedUrlData } = await supabaseAdmin.storage
              .from('talent-cvs')
              .createSignedUrl(storagePath, 3600);

            if (signedUrlData?.signedUrl) {
              return { ...talent, cv_url: signedUrlData.signedUrl };
            }
          }
        } catch (error) {
          console.error('Error generating signed URL for talent CV:', error);
        }
      }
      return talent;
    })
  );

  return (
    <DashboardClient
      user={user}
      talents={talentsWithSignedUrls}
      companies={companies || []}
      hiringRequests={hiringRequests || []}
    />
  );
}
