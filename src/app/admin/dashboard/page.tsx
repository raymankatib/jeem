import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import DashboardClient from "./DashboardClient";
import type { PaginationInfo } from "@/lib/types/pagination";
import type {
	TalentFilters,
	HiringRequestFilters,
	TalentStatusFilter,
	TalentEnglishFilter,
	HiringRequestAppStatusFilter,
	HiringRequestStatusFilter
} from "@/lib/types/filters";
import {
	VALID_TALENT_STATUSES,
	VALID_ENGLISH_LEVELS,
	VALID_REQUEST_APP_STATUSES,
	VALID_REQUEST_STATUSES
} from "@/lib/types/filters";
import { CONFIG } from "@/lib/config";

const PAGE_SIZE: number = 20;

// Helper functions to apply filters to Supabase queries
function applyTalentFilters<T extends { eq: (column: string, value: string) => T }>(
	query: T,
	filters: TalentFilters
): T {
	let filteredQuery = query;

	if (filters.status && filters.status !== "all") {
		filteredQuery = filteredQuery.eq("application_status", filters.status);
	}

	if (filters.role && filters.role !== "all") {
		filteredQuery = filteredQuery.eq("role", filters.role);
	}

	if (filters.englishLevel && filters.englishLevel !== "all") {
		filteredQuery = filteredQuery.eq("english_level", filters.englishLevel);
	}

	return filteredQuery;
}

function applyHiringRequestFilters<T extends { eq: (column: string, value: string) => T }>(
	query: T,
	filters: HiringRequestFilters
): T {
	let filteredQuery = query;

	if (filters.applicationStatus && filters.applicationStatus !== "all") {
		filteredQuery = filteredQuery.eq("application_status", filters.applicationStatus);
	}

	if (filters.requestStatus && filters.requestStatus !== "all") {
		filteredQuery = filteredQuery.eq("request_status", filters.requestStatus);
	}

	return filteredQuery;
}

interface PageProps {
	searchParams: Promise<{
		talentPage?: string;
		companyPage?: string;
		requestPage?: string;
		// Filter params - Talents
		talentStatus?: string;
		talentRole?: string;
		talentEnglish?: string;
		// Filter params - Hiring Requests
		requestAppStatus?: string;
		requestStatus?: string;
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

	// Parse and validate filter params
	const talentFilters: TalentFilters = {
		status: VALID_TALENT_STATUSES.includes(params.talentStatus as TalentStatusFilter)
			? (params.talentStatus as TalentStatusFilter)
			: "all",
		role: params.talentRole || "all",
		englishLevel: VALID_ENGLISH_LEVELS.includes(params.talentEnglish as TalentEnglishFilter)
			? (params.talentEnglish as TalentEnglishFilter)
			: "all"
	};

	const hiringRequestFilters: HiringRequestFilters = {
		applicationStatus: VALID_REQUEST_APP_STATUSES.includes(params.requestAppStatus as HiringRequestAppStatusFilter)
			? (params.requestAppStatus as HiringRequestAppStatusFilter)
			: "all",
		requestStatus: VALID_REQUEST_STATUSES.includes(params.requestStatus as HiringRequestStatusFilter)
			? (params.requestStatus as HiringRequestStatusFilter)
			: "all"
	};

	// Fetch talents and companies data
	const supabaseAdmin = getSupabaseAdmin();

	// Fetch talents with pagination and filters
	let talentQuery = supabaseAdmin.from("talents").select("*", { count: "exact" });

	// Apply filters
	talentQuery = applyTalentFilters(talentQuery, talentFilters);

	// Apply ordering and pagination
	const { data: talents, count: talentCount } = await talentQuery
		.order("created_at", { ascending: false })
		.range(talentOffset, talentOffset + PAGE_SIZE - 1);

	// Fetch companies with pagination
	const { data: companies, count: companyCount } = await supabaseAdmin
		.from("companies")
		.select("*", { count: "exact" })
		.order("created_at", { ascending: false })
		.range(companyOffset, companyOffset + PAGE_SIZE - 1);

	// Fetch hiring requests with company info, pagination, and filters
	let hiringRequestQuery = supabaseAdmin.from("hiring_requests").select(
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
	);

	// Apply filters
	hiringRequestQuery = applyHiringRequestFilters(hiringRequestQuery, hiringRequestFilters);

	// Apply ordering and pagination
	const { data: hiringRequests, count: requestCount } = await hiringRequestQuery
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
			talentFilters={talentFilters}
			availableRoles={CONFIG.roles_list}
			companies={companies || []}
			companyPagination={companyPagination}
			hiringRequests={hiringRequests || []}
			requestPagination={requestPagination}
			hiringRequestFilters={hiringRequestFilters}
		/>
	);
}
