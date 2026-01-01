import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import DashboardClient, { HiringRequest } from "./DashboardClient";

export default async function UserDashboardPage() {
	const supabase = await createServerSupabaseClient();

	const {
		data: { user },
		error
	} = await supabase.auth.getUser();

	if (error || !user) {
		redirect("/login");
	}

	// If user is admin, redirect to admin dashboard
	if (user.user_metadata?.role === "admin") {
		redirect("/admin/dashboard");
	}

	// Fetch user's profile data from talents or companies table
	const supabaseAdmin = getSupabaseAdmin();

	// Try to find user in talents table first
	const { data: talentProfile } = await supabaseAdmin.from("talents").select("*").eq("email", user.email).single();

	// If not in talents, try companies table
	const { data: companyProfile } = await supabaseAdmin.from("companies").select("*").eq("email", user.email).single();

	// Fetch hiring requests if user is a company
	let hiringRequests: HiringRequest[] = [];
	if (companyProfile) {
		const { data: requests } = await supabaseAdmin
			.from("hiring_requests")
			.select(
				`
        *,
        matched_talent:matched_talent_id (
          id,
          name,
          email,
          role,
          portfolio,
          english_level
        )
      `
			)
			.eq("company_id", companyProfile.id)
			.order("created_at", { ascending: false });
		hiringRequests = requests || [];
	}

	// Fetch matched hiring request if user is a talent with matched status
	let matchedHiringRequest = null;
	if (talentProfile && talentProfile.application_status === "matched") {
		const { data: matchedRequest } = await supabaseAdmin
			.from("hiring_requests")
			.select(
				`
        *,
        companies:company_id (
          id,
          company_name,
          contact_name,
          email,
          website
        )
      `
			)
			.eq("matched_talent_id", talentProfile.id)
			.single();
		matchedHiringRequest = matchedRequest;
	}

	// Generate signed URL for CV if user is a talent with CV
	let talentWithSignedUrl = talentProfile;
	if (talentProfile && talentProfile.cv_url) {
		try {
			const urlMatch = talentProfile.cv_url.match(/\/talent-cvs\/(.+)$/);
			if (urlMatch && urlMatch[1]) {
				const storagePath = urlMatch[1];
				const { data: signedUrlData } = await supabaseAdmin.storage
					.from("talent-cvs")
					.createSignedUrl(storagePath, 3600);

				if (signedUrlData?.signedUrl) {
					talentWithSignedUrl = { ...talentProfile, cv_url: signedUrlData.signedUrl };
				}
			}
		} catch (error) {
			console.error("Error generating signed URL for CV:", error);
		}
	}

	return (
		<DashboardClient
			user={user}
			talentProfile={talentWithSignedUrl}
			companyProfile={companyProfile}
			hiringRequests={hiringRequests}
			matchedHiringRequest={matchedHiringRequest}
		/>
	);
}
