// Filter type definitions for admin dashboard

// Talent filter types
export type TalentStatusFilter =
	| "all"
	| "under_review"
	| "interviewing"
	| "training"
	| "pending_matching"
	| "matched"
	| "rejected";

export type TalentRoleFilter = "all" | string; // Allow any role value

export type TalentEnglishFilter = "all" | "native" | "fluent" | "advanced" | "intermediate" | "basic";

// Hiring Request filter types
export type HiringRequestAppStatusFilter =
	| "all"
	| "under_review"
	| "reviewing_candidates"
	| "interviewing_candidates"
	| "negotiating"
	| "matched"
	| "rejected";

export type HiringRequestStatusFilter = "all" | "open" | "filled" | "cancelled";

// Filter interfaces
export interface TalentFilters {
	status?: TalentStatusFilter;
	role?: TalentRoleFilter;
	englishLevel?: TalentEnglishFilter;
}

export interface HiringRequestFilters {
	applicationStatus?: HiringRequestAppStatusFilter;
	requestStatus?: HiringRequestStatusFilter;
}

// Validation constants
export const VALID_TALENT_STATUSES: TalentStatusFilter[] = [
	"all",
	"under_review",
	"interviewing",
	"training",
	"pending_matching",
	"matched",
	"rejected"
];

export const VALID_ENGLISH_LEVELS: TalentEnglishFilter[] = ["all", "native", "fluent", "advanced", "intermediate", "basic"];

export const VALID_REQUEST_APP_STATUSES: HiringRequestAppStatusFilter[] = [
	"all",
	"under_review",
	"reviewing_candidates",
	"interviewing_candidates",
	"negotiating",
	"matched",
	"rejected"
];

export const VALID_REQUEST_STATUSES: HiringRequestStatusFilter[] = ["all", "open", "filled", "cancelled"];
