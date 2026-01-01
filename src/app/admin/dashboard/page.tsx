import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import DashboardClient from "./DashboardClient";
import type { PaginationInfo } from "@/lib/types/pagination";

const PAGE_SIZE: number = 20;

interface PageProps {
	searchParams: Promise<{
		talentPage?: string;
		companyPage?: string;
		requestPage?: string;
	}>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
	const supabase = await createServerSupabaseClient();

	const {
		data: { user },
		error
	} = await supabase.auth.getUser();

	if (error || !user) {
		redirect("/admin/login");
	}

	// Check if user is an admin
	if (user.user_metadata?.role !== "admin") {
		redirect("/");
	}

	// Parse pagination params
	const params = await searchParams;
	const talentPage = Math.max(1, parseInt(params.talentPage || "1") || 1);
	const companyPage = Math.max(1, parseInt(params.companyPage || "1") || 1);
	const requestPage = Math.max(1, parseInt(params.requestPage || "1") || 1);

	// Calculate offsets
	const talentOffset = (talentPage - 1) * PAGE_SIZE;
	const companyOffset = (companyPage - 1) * PAGE_SIZE;
	const requestOffset = (requestPage - 1) * PAGE_SIZE;

	// Fetch talents and companies data
	const supabaseAdmin = getSupabaseAdmin();

	// Fetch talents with pagination
	const { data: talents, count: talentCount } = await supabaseAdmin
		.from("talents")
		.select("*", { count: "exact" })
		.order("created_at", { ascending: false })
		.range(talentOffset, talentOffset + PAGE_SIZE - 1);

	// Fetch companies with pagination
	const { data: companies, count: companyCount } = await supabaseAdmin
		.from("companies")
		.select("*", { count: "exact" })
		.order("created_at", { ascending: false })
		.range(companyOffset, companyOffset + PAGE_SIZE - 1);

	// Fetch hiring requests with company info and pagination
	const { data: hiringRequests, count: requestCount } = await supabaseAdmin
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
    `,
			{ count: "exact" }
		)
		.order("created_at", { ascending: false })
		.range(requestOffset, requestOffset + PAGE_SIZE - 1);

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
							.from("talent-cvs")
							.createSignedUrl(storagePath, 3600);

						if (signedUrlData?.signedUrl) {
							return { ...talent, cv_url: signedUrlData.signedUrl };
						}
					}
				} catch (error) {
					console.error("Error generating signed URL for talent CV:", error);
				}
			}
			return talent;
		})
	);

	// Build pagination info objects
	const talentPagination: PaginationInfo = {
		page: talentPage,
		pageSize: PAGE_SIZE,
		totalCount: talentCount || 0,
		totalPages: Math.ceil((talentCount || 0) / PAGE_SIZE)
	};

	const companyPagination: PaginationInfo = {
		page: companyPage,
		pageSize: PAGE_SIZE,
		totalCount: companyCount || 0,
		totalPages: Math.ceil((companyCount || 0) / PAGE_SIZE)
	};

	const requestPagination: PaginationInfo = {
		page: requestPage,
		pageSize: PAGE_SIZE,
		totalCount: requestCount || 0,
		totalPages: Math.ceil((requestCount || 0) / PAGE_SIZE)
	};

	return (
		<DashboardClient
			user={user}
			talents={talentsWithSignedUrls}
			talentPagination={talentPagination}
			companies={companies || []}
			companyPagination={companyPagination}
			hiringRequests={hiringRequests || []}
			requestPagination={requestPagination}
		/>
	);
}
