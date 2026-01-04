"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
	LogOut,
	User as UserIcon,
	Users,
	Building2,
	Mail,
	ExternalLink,
	Eye,
	Calendar,
	Wrench,
	FileText,
	Phone,
	UserCheck,
	UserX
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { AuthNav } from "@/components/auth-nav";
import { Pagination } from "@/components/ui/pagination";
import type { PaginationInfo } from "@/lib/types/pagination";
import type { TalentFilters, HiringRequestFilters } from "@/lib/types/filters";
import { FilterBar } from "@/components/dashboard/filters";

type TalentStatus = "under_review" | "interviewing" | "training" | "pending_matching" | "matched" | "rejected";

interface Talent {
	id: string;
	name: string;
	email: string;
	country_code: string | null;
	phone_number: string | null;
	role: string;
	english_level: string;
	portfolio: string;
	shipped: string;
	tools: string | null;
	cv_url: string | null;
	cv_filename: string | null;
	image_url: string | null;
	image_filename: string | null;
	email_status: string | null;
	application_status: TalentStatus;
	salary?: number | null;
	created_at?: string;
}

interface Company {
	id: string;
	company_name: string;
	contact_name: string;
	email: string;
	country_code: string | null;
	phone_number: string | null;
	website: string | null;
	company_size: string;
	// REMOVED: roles_needed, project_type, budget_range, project_description, application_status
	// Project fields are now exclusively in hiring_requests table
	// application_status removed - companies don't have application status in multi-project model
	email_status: string | null;
	created_at?: string;
}

interface HiringRequest {
	id: string;
	company_id: string;
	request_title: string;
	roles_needed: string;
	project_type: string;
	budget_range: string | null;
	project_description: string;
	application_status: string;
	request_status: "open" | "filled" | "cancelled";
	created_at?: string;
	updated_at?: string;
	matched_talent_id?: string | null;
	matched_at?: string | null;
	companies?: {
		id: string;
		company_name: string;
		contact_name: string;
		email: string;
	};
}

interface DashboardClientProps {
	user: User;
	talents: Talent[];
	talentPagination: PaginationInfo;
	talentFilters: TalentFilters;
	availableRoles: string[];
	companies: Company[];
	companyPagination: PaginationInfo;
	hiringRequests: HiringRequest[];
	requestPagination: PaginationInfo;
	hiringRequestFilters: HiringRequestFilters;
}

export default function DashboardClient({
	user,
	talents,
	talentPagination,
	talentFilters,
	availableRoles,
	companies,
	companyPagination,
	hiringRequests,
	requestPagination,
	hiringRequestFilters
}: DashboardClientProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
	const [selectedRequest, setSelectedRequest] = useState<HiringRequest | null>(null);
	const [statusConfirmDialog, setStatusConfirmDialog] = useState<{
		isOpen: boolean;
		type: "talent" | "request";
		id: string;
		currentStatus: TalentStatus | string;
		newStatus: TalentStatus | string;
		name: string;
	} | null>(null);

	const [matchDialog, setMatchDialog] = useState<{
		isOpen: boolean;
		requestId: string;
		requestTitle: string;
	} | null>(null);

	const [unmatchDialog, setUnmatchDialog] = useState<{
		isOpen: boolean;
		requestId: string;
		requestTitle: string;
		talentId: string;
		talentName: string;
	} | null>(null);

	const [imagePreview, setImagePreview] = useState<{
		isOpen: boolean;
		imageUrl: string;
		talentName: string;
	} | null>(null);

	const [availableTalents, setAvailableTalents] = useState<Talent[]>([]);
	const [selectedTalentId, setSelectedTalentId] = useState<string>("");
	const [isLoadingTalents, setIsLoadingTalents] = useState(false);
	const [isMatching, setIsMatching] = useState(false);
	const [isUnmatching, setIsUnmatching] = useState(false);
	const [salaryEdits, setSalaryEdits] = useState<Record<string, number | null>>({});

	const handlePageChange = (tab: "talent" | "company" | "request", page: number) => {
		const params = new URLSearchParams(window.location.search);
		params.set(`${tab}Page`, page.toString());
		router.push(`/admin/dashboard?${params.toString()}`);
	};

	const handleFilterChange = (tab: "talent" | "request", filterKey: string, value: string) => {
		const params = new URLSearchParams(window.location.search);

		// Map tab and filterKey to URL param name
		const paramMap: Record<string, Record<string, string>> = {
			talent: {
				status: "talentStatus",
				role: "talentRole",
				englishLevel: "talentEnglish"
			},
			request: {
				applicationStatus: "requestAppStatus",
				requestStatus: "requestStatus"
			}
		};

		const paramName = paramMap[tab]?.[filterKey];
		if (!paramName) return;

		if (value === "all") {
			params.delete(paramName);
		} else {
			params.set(paramName, value);
		}

		// Reset to page 1 when filters change
		params.set(`${tab}Page`, "1");

		router.push(`/admin/dashboard?${params.toString()}`);
	};

	const handleClearFilters = (tab: "talent" | "request") => {
		const params = new URLSearchParams(window.location.search);

		if (tab === "talent") {
			params.delete("talentStatus");
			params.delete("talentRole");
			params.delete("talentEnglish");
			params.set("talentPage", "1");
		} else if (tab === "request") {
			params.delete("requestAppStatus");
			params.delete("requestStatus");
			params.set("requestPage", "1");
		}

		router.push(`/admin/dashboard?${params.toString()}`);
	};

	const handleLogout = async () => {
		const supabase = createClient();
		const { error } = await supabase.auth.signOut();

		if (error) {
			toast.error(t("auth.logout.error"));
			return;
		}

		toast.success(t("auth.logout.success"));
		router.push("/");
		router.refresh();
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric"
		});
	};

	const handleTalentStatusChange = (talentId: string, newStatus: TalentStatus) => {
		const talent = talents.find((t) => t.id === talentId);
		if (!talent || talent.application_status === newStatus) return;

		setStatusConfirmDialog({
			isOpen: true,
			type: "talent",
			id: talentId,
			currentStatus: talent.application_status,
			newStatus: newStatus,
			name: talent.name
		});
	};

	const confirmStatusUpdate = async () => {
		if (!statusConfirmDialog) return;

		const { type, id, newStatus } = statusConfirmDialog;

		// Determine endpoint based on type
		const endpoint = type === "talent" ? `/api/talents/${id}/status` : `/api/hiring-requests/${id}/status`;

		const successKey = type === "talent" ? "dashboard.talents.statusUpdated" : "dashboard.hiringRequests.statusUpdated";

		const errorKey =
			type === "talent" ? "dashboard.talents.statusUpdateFailed" : "dashboard.hiringRequests.statusUpdateFailed";

		try {
			const response = await fetch(endpoint, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ application_status: newStatus })
			});

			if (!response.ok) {
				throw new Error("Failed to update status");
			}

			toast.success(t(successKey));
			setStatusConfirmDialog(null);
			router.refresh();
		} catch (error) {
			console.error("Error updating status:", error);
			toast.error(t(errorKey));
		}
	};

	// Salary handlers
	const handleSalaryChange = (talentId: string, value: string) => {
		const numValue = value === "" ? null : parseFloat(value);
		setSalaryEdits((prev) => ({
			...prev,
			[talentId]: numValue
		}));
	};

	const handleSalaryUpdate = async (talentId: string, value: string) => {
		const numValue = value === "" ? null : parseFloat(value);

		// Don't update if value hasn't changed
		const talent = talents.find((t) => t.id === talentId);
		if (talent && talent.salary === numValue) return;

		try {
			const response = await fetch(`/api/talents/${talentId}/salary`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ salary: numValue })
			});

			if (!response.ok) {
				throw new Error("Failed to update salary");
			}

			toast.success(t("dashboard.talents.salaryUpdated"));
			router.refresh();
		} catch (error) {
			console.error("Error updating salary:", error);
			toast.error(t("dashboard.talents.salaryUpdateFailed"));
		}
	};

	// Matching handlers
	const handleOpenMatchDialog = async (request: HiringRequest) => {
		setMatchDialog({
			isOpen: true,
			requestId: request.id,
			requestTitle: request.request_title
		});
		setSelectedTalentId("");

		// Fetch available talents
		setIsLoadingTalents(true);
		try {
			const response = await fetch("/api/talents/available");
			const result = await response.json();

			if (response.ok && result.success) {
				setAvailableTalents(result.data || []);
			} else {
				toast.error(t("dashboard.hiringRequests.match.matchError"));
				setAvailableTalents([]);
			}
		} catch (error) {
			console.error("Error fetching available talents:", error);
			toast.error(t("dashboard.hiringRequests.match.matchError"));
			setAvailableTalents([]);
		} finally {
			setIsLoadingTalents(false);
		}
	};

	const handleConfirmMatch = async () => {
		if (!matchDialog || !selectedTalentId) return;

		setIsMatching(true);
		try {
			const response = await fetch(`/api/hiring-requests/${matchDialog.requestId}/match`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ talent_id: selectedTalentId })
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success(t("dashboard.hiringRequests.match.matchSuccess"));
				setMatchDialog(null);
				setSelectedTalentId("");
				router.refresh();
			} else {
				toast.error(result.error || t("dashboard.hiringRequests.match.matchError"));
			}
		} catch (error) {
			console.error("Error matching talent:", error);
			toast.error(t("dashboard.hiringRequests.match.matchError"));
		} finally {
			setIsMatching(false);
		}
	};

	const handleOpenUnmatchDialog = (request: HiringRequest) => {
		if (!request.matched_talent_id) return;

		// Find the matched talent to get their name
		const matchedTalent = talents.find((t) => t.id === request.matched_talent_id);

		setUnmatchDialog({
			isOpen: true,
			requestId: request.id,
			requestTitle: request.request_title,
			talentId: request.matched_talent_id,
			talentName: matchedTalent?.name || "Unknown"
		});
	};

	const handleConfirmUnmatch = async () => {
		if (!unmatchDialog) return;

		setIsUnmatching(true);
		try {
			const response = await fetch(`/api/hiring-requests/${unmatchDialog.requestId}/match`, {
				method: "DELETE"
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success(t("dashboard.hiringRequests.unmatch.unmatchSuccess"));
				setUnmatchDialog(null);
				router.refresh();
			} else {
				toast.error(result.error || t("dashboard.hiringRequests.unmatch.unmatchError"));
			}
		} catch (error) {
			console.error("Error unmatching talent:", error);
			toast.error(t("dashboard.hiringRequests.unmatch.unmatchError"));
		} finally {
			setIsUnmatching(false);
		}
	};

	const talentStatuses: { value: TalentStatus; labelKey: string }[] = [
		{ value: "under_review", labelKey: "dashboard.status.talent.underReview" },
		{ value: "interviewing", labelKey: "dashboard.status.talent.interviewing" },
		{ value: "training", labelKey: "dashboard.status.talent.training" },
		{ value: "pending_matching", labelKey: "dashboard.status.talent.pendingMatching" },
		{ value: "matched", labelKey: "dashboard.status.talent.matched" },
		{ value: "rejected", labelKey: "dashboard.status.talent.rejected" }
	];

	return (
		<>
			<AuthNav />
			<div className="min-h-screen bg-background pt-24 p-8">
				<div className="max-w-7xl mx-auto">
					<div className="flex justify-between items-center mb-8">
						<div>
							<h1 className="text-3xl font-semibold tracking-tight mb-2">{t("dashboard.title")}</h1>
							<p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
						</div>
						<Button variant="outline" onClick={handleLogout}>
							<LogOut className="h-4 w-4 me-2" />
							{t("auth.logout.button")}
						</Button>
					</div>

					{/* Stats Cards */}
					<div className="grid gap-6 md:grid-cols-3 mb-8">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("dashboard.stats.totalTalents")}</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{talentPagination.totalCount}</div>
								<p className="text-xs text-muted-foreground">{t("dashboard.stats.talentsDesc")}</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("dashboard.stats.totalCompanies")}</CardTitle>
								<Building2 className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{companyPagination.totalCount}</div>
								<p className="text-xs text-muted-foreground">{t("dashboard.stats.companiesDesc")}</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("dashboard.profile.title")}</CardTitle>
								<UserIcon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-sm font-medium">{user.user_metadata?.full_name || "Admin"}</div>
								<p className="text-xs text-muted-foreground">{user.email}</p>
							</CardContent>
						</Card>
					</div>

					{/* Tables */}
					<Tabs defaultValue="talents" className="space-y-4">
						<TabsList>
							<TabsTrigger value="talents" className="flex items-center gap-2">
								<Users className="h-4 w-4" />
								{t("dashboard.tabs.talents")} ({talentPagination.totalCount})
							</TabsTrigger>
							<TabsTrigger value="companies" className="flex items-center gap-2">
								<Building2 className="h-4 w-4" />
								{t("dashboard.tabs.companies")} ({companyPagination.totalCount})
							</TabsTrigger>
							<TabsTrigger value="hiring-requests" className="flex items-center gap-2">
								<FileText className="h-4 w-4" />
								{t("dashboard.hiringRequests.titleAdmin")} ({requestPagination.totalCount})
							</TabsTrigger>
						</TabsList>

						<TabsContent value="talents" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>{t("dashboard.talents.title")}</CardTitle>
									<CardDescription>{t("dashboard.talents.description")}</CardDescription>
								</CardHeader>
								<CardContent>
									<FilterBar
										filters={{
											status: talentFilters.status || "all",
											role: talentFilters.role || "all",
											englishLevel: talentFilters.englishLevel || "all"
										}}
										onFilterChange={(key, value) => handleFilterChange("talent", key, value)}
										onClearFilters={() => handleClearFilters("talent")}
										filterConfig={[
											{
												key: "status",
												labelKey: "dashboard.filters.talentStatus",
												options: [
													{ value: "all", labelKey: "dashboard.filters.all" },
													{ value: "under_review", labelKey: "dashboard.status.talent.underReview" },
													{ value: "interviewing", labelKey: "dashboard.status.talent.interviewing" },
													{ value: "training", labelKey: "dashboard.status.talent.training" },
													{ value: "pending_matching", labelKey: "dashboard.status.talent.pendingMatching" },
													{ value: "matched", labelKey: "dashboard.status.talent.matched" },
													{ value: "rejected", labelKey: "dashboard.status.talent.rejected" }
												]
											},
											{
												key: "role",
												labelKey: "dashboard.filters.role",
												options: [
													{ value: "all", labelKey: "dashboard.filters.all" },
													...availableRoles.map((role) => ({
														value: role,
														labelKey: role
													}))
												]
											},
											{
												key: "englishLevel",
												labelKey: "dashboard.filters.englishLevel",
												options: [
													{ value: "all", labelKey: "dashboard.filters.all" },
													{ value: "native", labelKey: "applicationForm.fields.englishLevel.options.native" },
													{ value: "fluent", labelKey: "applicationForm.fields.englishLevel.options.fluent" },
													{ value: "advanced", labelKey: "applicationForm.fields.englishLevel.options.advanced" },
													{ value: "intermediate", labelKey: "applicationForm.fields.englishLevel.options.intermediate" },
													{ value: "basic", labelKey: "applicationForm.fields.englishLevel.options.basic" }
												]
											}
										]}
									/>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{t("dashboard.talents.table.name")}</TableHead>
												<TableHead>{t("dashboard.talents.table.email")}</TableHead>
												<TableHead>{t("dashboard.talents.table.phone")}</TableHead>
												<TableHead>{t("dashboard.talents.table.role")}</TableHead>
												<TableHead>{t("dashboard.talents.table.englishLevel")}</TableHead>
												<TableHead>{t("dashboard.talents.table.tools")}</TableHead>
												<TableHead>{t("dashboard.talents.table.salary")}</TableHead>
												<TableHead>{t("dashboard.talents.table.portfolio")}</TableHead>
												<TableHead>{t("dashboard.talents.table.cv")}</TableHead>
												<TableHead>{t("dashboard.talents.table.appliedDate")}</TableHead>
												<TableHead>{t("dashboard.talents.table.status")}</TableHead>
												<TableHead>{t("dashboard.talents.table.actions")}</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{talents.length === 0 ? (
												<TableRow>
													<TableCell colSpan={12} className="text-center text-muted-foreground">
														{t("dashboard.talents.empty")}
													</TableCell>
												</TableRow>
											) : (
												talents.map((talent) => (
													<TableRow key={talent.id}>
														<TableCell className="font-medium">
															<div className="flex items-center gap-3">
																{talent.image_url ? (
																	<Image
																		src={talent.image_url}
																		alt={talent.name}
																		width={32}
																		height={32}
																		className="rounded-full object-cover"
																	/>
																) : (
																	<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
																		<UserIcon className="h-4 w-4 text-muted-foreground" />
																	</div>
																)}
																<span>{talent.name}</span>
															</div>
														</TableCell>
														<TableCell>
															<a
																href={`mailto:${talent.email}`}
																className="flex items-center gap-1 text-sm hover:underline"
															>
																<Mail className="h-3 w-3" />
																{talent.email}
															</a>
														</TableCell>
														<TableCell>
															{talent.phone_number ? (
																<a
																	href={`tel:${talent.country_code}${talent.phone_number}`}
																	className="flex items-center gap-1 text-sm hover:underline"
																>
																	<Phone className="h-3 w-3" />
																	{talent.country_code} {talent.phone_number}
																</a>
															) : (
																<span className="text-muted-foreground text-sm">-</span>
															)}
														</TableCell>
														<TableCell>
															<div className="max-w-[150px] truncate">{talent.role}</div>
														</TableCell>
														<TableCell>
															<Badge variant="outline">{talent.english_level}</Badge>
														</TableCell>
														<TableCell>
															{talent.tools ? (
																<div className="flex items-center gap-1 max-w-[200px]">
																	<Wrench className="h-3 w-3 text-muted-foreground shrink-0" />
																	<span className="text-sm truncate">{talent.tools}</span>
																</div>
															) : (
																<span className="text-muted-foreground text-sm">-</span>
															)}
														</TableCell>
														<TableCell>
															<input
																type="number"
																value={salaryEdits[talent.id] !== undefined ? salaryEdits[talent.id] || "" : talent.salary || ""}
																onChange={(e) => handleSalaryChange(talent.id, e.target.value)}
																onBlur={(e) => handleSalaryUpdate(talent.id, e.target.value)}
																placeholder="Enter salary"
																className="w-[120px] h-8 px-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
															/>
														</TableCell>
														<TableCell>
															{talent.portfolio ? (
																<a
																	href={talent.portfolio}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
																>
																	<ExternalLink className="h-3 w-3" />
																	{t("dashboard.talents.table.viewPortfolio")}
																</a>
															) : (
																<span className="text-muted-foreground text-sm">-</span>
															)}
														</TableCell>
														<TableCell>
															{talent.cv_url ? (
																<a
																	href={talent.cv_url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
																>
																	<FileText className="h-3 w-3" />
																	{t("dashboard.talents.table.viewCV")}
																</a>
															) : (
																<span className="text-muted-foreground text-sm">-</span>
															)}
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-1 text-sm text-muted-foreground">
																<Calendar className="h-3 w-3" />
																{formatDate(talent.created_at)}
															</div>
														</TableCell>
														<TableCell>
															<Select
																value={talent.application_status}
																onValueChange={(value) => handleTalentStatusChange(talent.id, value as TalentStatus)}
															>
																<SelectTrigger className="w-[180px] h-8">
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	{talentStatuses.map((status) => (
																		<SelectItem key={status.value} value={status.value}>
																			{t(status.labelKey)}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</TableCell>
														<TableCell>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => setSelectedTalent(talent)}
																className="h-8"
															>
																<Eye className="h-4 w-4 me-1" />
																{t("dashboard.talents.table.details")}
															</Button>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
									<Pagination
										currentPage={talentPagination.page}
										totalPages={talentPagination.totalPages}
										totalCount={talentPagination.totalCount}
										pageSize={talentPagination.pageSize}
										onPageChange={(page) => handlePageChange("talent", page)}
									/>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="companies" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>{t("dashboard.companies.title")}</CardTitle>
									<CardDescription>{t("dashboard.companies.description")}</CardDescription>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{t("dashboard.companies.table.companyName")}</TableHead>
												<TableHead>{t("dashboard.companies.table.contactName")}</TableHead>
												<TableHead>{t("dashboard.companies.table.email")}</TableHead>
												<TableHead>{t("dashboard.companies.table.phone")}</TableHead>
												<TableHead>{t("dashboard.companies.table.companySize")}</TableHead>
												<TableHead>{t("dashboard.companies.table.submittedDate")}</TableHead>
												<TableHead>{t("dashboard.companies.table.actions")}</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{companies.length === 0 ? (
												<TableRow>
													<TableCell colSpan={7} className="text-center text-muted-foreground">
														{t("dashboard.companies.empty")}
													</TableCell>
												</TableRow>
											) : (
												companies.map((company) => (
													<TableRow key={company.id}>
														<TableCell className="font-medium">
															{company.website ? (
																<a
																	href={company.website}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="flex items-center gap-1 hover:underline max-w-[150px] truncate"
																>
																	{company.company_name}
																	<ExternalLink className="h-3 w-3 shrink-0" />
																</a>
															) : (
																<div className="max-w-[150px] truncate">{company.company_name}</div>
															)}
														</TableCell>
														<TableCell>{company.contact_name}</TableCell>
														<TableCell>
															<a
																href={`mailto:${company.email}`}
																className="flex items-center gap-1 text-sm hover:underline"
															>
																<Mail className="h-3 w-3" />
																{company.email}
															</a>
														</TableCell>
														<TableCell>
															{company.phone_number ? (
																<a
																	href={`tel:${company.country_code}${company.phone_number}`}
																	className="flex items-center gap-1 text-sm hover:underline"
																>
																	<Phone className="h-3 w-3" />
																	{company.country_code} {company.phone_number}
																</a>
															) : (
																<span className="text-muted-foreground text-sm">-</span>
															)}
														</TableCell>
														<TableCell>
															<Badge variant="outline">{company.company_size}</Badge>
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-1 text-sm text-muted-foreground">
																<Calendar className="h-3 w-3" />
																{formatDate(company.created_at)}
															</div>
														</TableCell>
														<TableCell>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => setSelectedCompany(company)}
																className="h-8"
															>
																<Eye className="h-4 w-4 me-1" />
																{t("dashboard.companies.table.details")}
															</Button>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
									<Pagination
										currentPage={companyPagination.page}
										totalPages={companyPagination.totalPages}
										totalCount={companyPagination.totalCount}
										pageSize={companyPagination.pageSize}
										onPageChange={(page) => handlePageChange("company", page)}
									/>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Hiring Requests Tab */}
						<TabsContent value="hiring-requests" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>{t("dashboard.hiringRequests.titleAdmin")}</CardTitle>
									<CardDescription>{t("dashboard.hiringRequests.description")}</CardDescription>
								</CardHeader>
								<CardContent>
									<FilterBar
										filters={{
											applicationStatus: hiringRequestFilters.applicationStatus || "all",
											requestStatus: hiringRequestFilters.requestStatus || "all"
										}}
										onFilterChange={(key, value) => handleFilterChange("request", key, value)}
										onClearFilters={() => handleClearFilters("request")}
										filterConfig={[
											{
												key: "applicationStatus",
												labelKey: "dashboard.filters.applicationStatus",
												options: [
													{ value: "all", labelKey: "dashboard.filters.all" },
													{ value: "under_review", labelKey: "dashboard.hiringRequests.applicationStatus.under_review" },
													{
														value: "reviewing_candidates",
														labelKey: "dashboard.hiringRequests.applicationStatus.reviewing_candidates"
													},
													{
														value: "interviewing_candidates",
														labelKey: "dashboard.hiringRequests.applicationStatus.interviewing_candidates"
													},
													{ value: "negotiating", labelKey: "dashboard.hiringRequests.applicationStatus.negotiating" },
													{ value: "matched", labelKey: "dashboard.hiringRequests.applicationStatus.matched" },
													{ value: "rejected", labelKey: "dashboard.hiringRequests.applicationStatus.rejected" }
												]
											},
											{
												key: "requestStatus",
												labelKey: "dashboard.filters.requestStatus",
												options: [
													{ value: "all", labelKey: "dashboard.filters.all" },
													{ value: "open", labelKey: "dashboard.hiringRequests.status.open" },
													{ value: "filled", labelKey: "dashboard.hiringRequests.status.filled" },
													{ value: "cancelled", labelKey: "dashboard.hiringRequests.status.cancelled" }
												]
											}
										]}
									/>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{t("dashboard.hiringRequests.table.requestTitle")}</TableHead>
												<TableHead>{t("dashboard.hiringRequests.table.company")}</TableHead>
												<TableHead>{t("dashboard.hiringRequests.table.role")}</TableHead>
												<TableHead>{t("dashboard.hiringRequests.table.projectType")}</TableHead>
												<TableHead>{t("dashboard.hiringRequests.table.budget")}</TableHead>
												<TableHead>{t("dashboard.hiringRequests.table.matchedTalent")}</TableHead>
												<TableHead>{t("dashboard.hiringRequests.table.requestStatus")}</TableHead>
												<TableHead>{t("dashboard.hiringRequests.table.applicationStatus")}</TableHead>
												<TableHead>{t("dashboard.hiringRequests.table.created")}</TableHead>
												<TableHead>{t("dashboard.hiringRequests.table.actions")}</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{hiringRequests.length === 0 ? (
												<TableRow>
													<TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
														{t("dashboard.hiringRequests.table.empty")}
													</TableCell>
												</TableRow>
											) : (
												hiringRequests.map((request) => {
													const matchedTalent = request.matched_talent_id
														? talents.find((t) => t.id === request.matched_talent_id)
														: null;

													return (
														<TableRow key={request.id}>
															<TableCell className="font-medium">{request.request_title}</TableCell>
															<TableCell>
																<div className="flex flex-col">
																	<span className="font-medium">{request.companies?.company_name}</span>
																	<span className="text-xs text-muted-foreground">
																		{request.companies?.contact_name}
																	</span>
																</div>
															</TableCell>
															<TableCell>{request.roles_needed}</TableCell>
															<TableCell>
																<Badge variant="outline">{request.project_type}</Badge>
															</TableCell>
															<TableCell>{request.budget_range || "-"}</TableCell>
															<TableCell>
																{matchedTalent ? (
																	<div className="flex items-center gap-2">
																		<Badge variant="default" className="shrink-0">
																			<UserCheck className="h-3 w-3 me-1" />
																			Matched
																		</Badge>
																		<span className="text-sm truncate max-w-[150px]">{matchedTalent.name}</span>
																	</div>
																) : (
																	<span className="text-muted-foreground text-sm">-</span>
																)}
															</TableCell>
															<TableCell>
																<Badge variant={request.request_status === "filled" ? "default" : "secondary"}>
																	{t(`dashboard.hiringRequests.status.${request.request_status}`)}
																</Badge>
															</TableCell>
														<TableCell>
															<Select
																value={request.application_status}
																onValueChange={(value) => {
																	setStatusConfirmDialog({
																		isOpen: true,
																		type: "request",
																		id: request.id,
																		currentStatus: request.application_status,
																		newStatus: value,
																		name: request.request_title
																	});
																}}
															>
																<SelectTrigger className="w-[200px]">
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="under_review">
																		{t("dashboard.hiringRequests.applicationStatus.under_review")}
																	</SelectItem>
																	<SelectItem value="reviewing_candidates">
																		{t("dashboard.hiringRequests.applicationStatus.reviewing_candidates")}
																	</SelectItem>
																	<SelectItem value="interviewing_candidates">
																		{t("dashboard.hiringRequests.applicationStatus.interviewing_candidates")}
																	</SelectItem>
																	<SelectItem value="negotiating">
																		{t("dashboard.hiringRequests.applicationStatus.negotiating")}
																	</SelectItem>
																	<SelectItem value="matched">
																		{t("dashboard.hiringRequests.applicationStatus.matched")}
																	</SelectItem>
																	<SelectItem value="rejected">
																		{t("dashboard.hiringRequests.applicationStatus.rejected")}
																	</SelectItem>
																</SelectContent>
															</Select>
														</TableCell>
															<TableCell>{formatDate(request.created_at)}</TableCell>
															<TableCell>
																<div className="flex items-center gap-2">
																	{request.matched_talent_id ? (
																		<Button
																			variant="destructive"
																			size="sm"
																			onClick={() => handleOpenUnmatchDialog(request)}
																			className="h-8"
																		>
																			<UserX className="h-4 w-4 me-1" />
																			{t("dashboard.hiringRequests.match.unmatchButton")}
																		</Button>
																	) : (
																		<Button
																			variant="default"
																			size="sm"
																			onClick={() => handleOpenMatchDialog(request)}
																			className="h-8"
																		>
																			<UserCheck className="h-4 w-4 me-1" />
																			{t("dashboard.hiringRequests.match.button")}
																		</Button>
																	)}
																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={() => setSelectedRequest(request)}
																		className="h-8"
																	>
																		<Eye className="h-4 w-4 me-1" />
																		{t("dashboard.hiringRequests.table.viewDetails")}
																	</Button>
																</div>
															</TableCell>
														</TableRow>
													);
												})
											)}
										</TableBody>
									</Table>
									<Pagination
										currentPage={requestPagination.page}
										totalPages={requestPagination.totalPages}
										totalCount={requestPagination.totalCount}
										pageSize={requestPagination.pageSize}
										onPageChange={(page) => handlePageChange("request", page)}
									/>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>

					{/* Talent Detail Dialog */}
					<Dialog open={!!selectedTalent} onOpenChange={() => setSelectedTalent(null)}>
						<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>{t("dashboard.talents.details.title")}</DialogTitle>
								<DialogDescription>{t("dashboard.talents.details.description")}</DialogDescription>
							</DialogHeader>
							{selectedTalent && (
								<div className="space-y-4 mt-4">
									{/* Profile Image */}
									{selectedTalent.image_url && (
										<div className="flex justify-center pb-4 border-b">
											<button
												onClick={() =>
													setImagePreview({
														isOpen: true,
														imageUrl: selectedTalent.image_url!,
														talentName: selectedTalent.name
													})
												}
												className="relative group cursor-pointer"
											>
												<Image
													src={selectedTalent.image_url}
													alt={selectedTalent.name}
													width={120}
													height={120}
													className="rounded-full object-cover border-4 border-primary/10 transition-all group-hover:border-primary/30"
												/>
												<div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
													<Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
												</div>
											</button>
										</div>
									)}

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.table.name")}
											</label>
											<p className="text-sm mt-1">{selectedTalent.name}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.table.email")}
											</label>
											<a
												href={`mailto:${selectedTalent.email}`}
												className="text-sm mt-1 text-blue-600 hover:underline block"
											>
												{selectedTalent.email}
											</a>
										</div>
										{selectedTalent.phone_number && (
											<div>
												<label className="text-sm font-medium text-muted-foreground">
													{t("dashboard.talents.table.phone")}
												</label>
												<a
													href={`tel:${selectedTalent.country_code}${selectedTalent.phone_number}`}
													className="text-sm mt-1 text-blue-600 hover:underline flex items-center gap-1"
												>
													<Phone className="h-3 w-3" />
													{selectedTalent.country_code} {selectedTalent.phone_number}
												</a>
											</div>
										)}
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.table.role")}
											</label>
											<p className="text-sm mt-1">{selectedTalent.role}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.table.englishLevel")}
											</label>
											<p className="text-sm mt-1">
												<Badge variant="outline">{selectedTalent.english_level}</Badge>
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.table.appliedDate")}
											</label>
											<p className="text-sm mt-1">{formatDate(selectedTalent.created_at)}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.table.status")}
											</label>
											<p className="text-sm mt-1">
												<Badge variant={selectedTalent.email_status === "sent" ? "default" : "secondary"}>
													{selectedTalent.email_status || "pending"}
												</Badge>
											</p>
										</div>
									</div>

									{selectedTalent.portfolio && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.details.portfolio")}
											</label>
											<a
												href={selectedTalent.portfolio}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm mt-1 text-blue-600 hover:underline flex items-center gap-1"
											>
												{selectedTalent.portfolio}
												<ExternalLink className="h-3 w-3" />
											</a>
										</div>
									)}

									{selectedTalent.tools && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.details.tools")}
											</label>
											<p className="text-sm mt-1">{selectedTalent.tools}</p>
										</div>
									)}

									{selectedTalent.cv_url && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.details.cv")}
											</label>
											<div className="mt-1 flex items-center gap-3">
												<a
													href={selectedTalent.cv_url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm text-blue-600 hover:underline flex items-center gap-1"
												>
													<FileText className="h-4 w-4" />
													{selectedTalent.cv_filename || "CV.pdf"}
													<ExternalLink className="h-3 w-3" />
												</a>
											</div>
										</div>
									)}

									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.talents.details.shipped")}
										</label>
										<p className="text-sm mt-1 whitespace-pre-wrap">{selectedTalent.shipped}</p>
									</div>

									{/* Matched Hiring Request Section */}
									{selectedTalent.application_status === "matched" && (() => {
										const matchedRequest = hiringRequests.find((r) => r.matched_talent_id === selectedTalent.id);
										return matchedRequest ? (
											<div className="border-t pt-4">
												<h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
													<FileText className="h-4 w-4" />
													{t("dashboard.talents.details.matchedRequest")}
												</h4>
												<div className="space-y-3 bg-muted/50 rounded-lg p-4">
													<div className="grid grid-cols-2 gap-4">
														<div>
															<label className="text-xs font-medium text-muted-foreground">
																{t("dashboard.hiringRequests.table.requestTitle")}
															</label>
															<p className="text-sm mt-1 font-medium">{matchedRequest.request_title}</p>
														</div>
														<div>
															<label className="text-xs font-medium text-muted-foreground">
																{t("dashboard.hiringRequests.table.company")}
															</label>
															<p className="text-sm mt-1 font-medium">{matchedRequest.companies?.company_name}</p>
															<p className="text-xs text-muted-foreground">{matchedRequest.companies?.contact_name}</p>
														</div>
														<div>
															<label className="text-xs font-medium text-muted-foreground">
																{t("dashboard.hiringRequests.table.role")}
															</label>
															<p className="text-sm mt-1">{matchedRequest.roles_needed}</p>
														</div>
														<div>
															<label className="text-xs font-medium text-muted-foreground">
																{t("dashboard.hiringRequests.table.projectType")}
															</label>
															<p className="text-sm mt-1">
																<Badge variant="outline" className="text-xs">{matchedRequest.project_type}</Badge>
															</p>
														</div>
														{matchedRequest.budget_range && (
															<div>
																<label className="text-xs font-medium text-muted-foreground">
																	{t("dashboard.hiringRequests.table.budget")}
																</label>
																<p className="text-sm mt-1">{matchedRequest.budget_range}</p>
															</div>
														)}
														{matchedRequest.matched_at && (
															<div>
																<label className="text-xs font-medium text-muted-foreground">
																	{t("dashboard.talents.details.matchedDate")}
																</label>
																<p className="text-sm mt-1">{formatDate(matchedRequest.matched_at)}</p>
															</div>
														)}
													</div>
													{matchedRequest.project_description && (
														<div className="pt-2 border-t">
															<label className="text-xs font-medium text-muted-foreground">
																{t("dashboard.hiringRequests.details.projectDescription")}
															</label>
															<p className="text-xs mt-1 text-muted-foreground line-clamp-3">
																{matchedRequest.project_description}
															</p>
														</div>
													)}
												</div>
											</div>
										) : null;
									})()}
								</div>
							)}
						</DialogContent>
					</Dialog>

					{/* Company Detail Dialog */}
					<Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
						<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>{t("dashboard.companies.details.title")}</DialogTitle>
								<DialogDescription>{t("dashboard.companies.details.description")}</DialogDescription>
							</DialogHeader>
							{selectedCompany && (
								<div className="space-y-4 mt-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.companies.table.companyName")}
											</label>
											<p className="text-sm mt-1">{selectedCompany.company_name}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.companies.table.contactName")}
											</label>
											<p className="text-sm mt-1">{selectedCompany.contact_name}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.companies.table.email")}
											</label>
											<a
												href={`mailto:${selectedCompany.email}`}
												className="text-sm mt-1 text-blue-600 hover:underline block"
											>
												{selectedCompany.email}
											</a>
										</div>
										{selectedCompany.phone_number && (
											<div>
												<label className="text-sm font-medium text-muted-foreground">
													{t("dashboard.companies.table.phone")}
												</label>
												<a
													href={`tel:${selectedCompany.country_code}${selectedCompany.phone_number}`}
													className="text-sm mt-1 text-blue-600 hover:underline flex items-center gap-1"
												>
													<Phone className="h-3 w-3" />
													{selectedCompany.country_code} {selectedCompany.phone_number}
												</a>
											</div>
										)}
										{selectedCompany.website && (
											<div>
												<label className="text-sm font-medium text-muted-foreground">
													{t("dashboard.companies.details.website")}
												</label>
												<a
													href={selectedCompany.website}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm mt-1 text-blue-600 hover:underline flex items-center gap-1"
												>
													{selectedCompany.website}
													<ExternalLink className="h-3 w-3" />
												</a>
											</div>
										)}
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.companies.table.companySize")}
											</label>
											<p className="text-sm mt-1">
												<Badge variant="outline">{selectedCompany.company_size}</Badge>
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.companies.table.submittedDate")}
											</label>
											<p className="text-sm mt-1">{formatDate(selectedCompany.created_at)}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.companies.table.status")}
											</label>
											<p className="text-sm mt-1">
												<Badge variant={selectedCompany.email_status === "sent" ? "default" : "secondary"}>
													{selectedCompany.email_status || "pending"}
												</Badge>
											</p>
										</div>
									</div>

									{/* Company Hiring Requests Section */}
									{(() => {
										const companyRequests = hiringRequests.filter((r) => r.company_id === selectedCompany.id);
										return companyRequests.length > 0 ? (
											<div className="border-t pt-4">
												<h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
													<FileText className="h-4 w-4" />
													{t("dashboard.companies.details.hiringRequests")} ({companyRequests.length})
												</h4>
												<div className="space-y-3">
													{companyRequests.map((request) => {
														const matchedTalent = request.matched_talent_id
															? talents.find((t) => t.id === request.matched_talent_id)
															: null;
														return (
															<div key={request.id} className="bg-muted/50 rounded-lg p-4 space-y-3">
																<div className="flex items-start justify-between gap-2">
																	<div className="flex-1">
																		<p className="font-medium text-sm">{request.request_title}</p>
																		<p className="text-xs text-muted-foreground mt-1">
																			{request.roles_needed} • {request.project_type}
																		</p>
																	</div>
																	<div className="flex items-center gap-2 shrink-0">
																		<Badge
																			variant={request.request_status === "filled" ? "default" : "secondary"}
																			className="text-xs"
																		>
																			{t(`dashboard.hiringRequests.status.${request.request_status}`)}
																		</Badge>
																	</div>
																</div>

																{/* Matched Talent Info */}
																{matchedTalent ? (
																	<div className="border-t pt-3 mt-3">
																		<div className="flex items-center gap-2 mb-2">
																			<UserCheck className="h-3 w-3 text-green-600" />
																			<span className="text-xs font-medium text-green-600">
																				{t("dashboard.companies.details.matchedWith")}
																			</span>
																		</div>
																		<div className="grid grid-cols-2 gap-3 text-xs">
																			<div>
																				<span className="text-muted-foreground">
																					{t("dashboard.talents.table.name")}:
																				</span>{" "}
																				<span className="font-medium">{matchedTalent.name}</span>
																			</div>
																			<div>
																				<span className="text-muted-foreground">
																					{t("dashboard.talents.table.role")}:
																				</span>{" "}
																				{matchedTalent.role}
																			</div>
																			<div>
																				<span className="text-muted-foreground">
																					{t("dashboard.talents.table.email")}:
																				</span>{" "}
																				<a
																					href={`mailto:${matchedTalent.email}`}
																					className="text-blue-600 hover:underline"
																				>
																					{matchedTalent.email}
																				</a>
																			</div>
																			{request.matched_at && (
																				<div>
																					<span className="text-muted-foreground">
																						{t("dashboard.companies.details.matchedDate")}:
																					</span>{" "}
																					{formatDate(request.matched_at)}
																				</div>
																			)}
																		</div>
																	</div>
																) : (
																	<p className="text-xs text-muted-foreground pt-2 border-t">
																		{t("dashboard.companies.details.notMatched")}
																	</p>
																)}
															</div>
														);
													})}
												</div>
											</div>
										) : null;
									})()}
								</div>
							)}
						</DialogContent>
					</Dialog>

					{/* Hiring Request Detail Dialog */}
					<Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
						<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>{t("dashboard.hiringRequests.details.title")}</DialogTitle>
								<DialogDescription>{t("dashboard.hiringRequests.details.description")}</DialogDescription>
							</DialogHeader>
							{selectedRequest && (
								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-semibold mb-2">{selectedRequest.request_title}</h3>
										<div className="flex items-center gap-2">
											<Badge variant={selectedRequest.request_status === "filled" ? "default" : "secondary"}>
												{t(`dashboard.hiringRequests.status.${selectedRequest.request_status}`)}
											</Badge>
											<Badge variant="outline">
												{t(`dashboard.hiringRequests.applicationStatus.${selectedRequest.application_status}`)}
											</Badge>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.hiringRequests.details.company")}
											</label>
											<p className="text-sm mt-1 font-medium">{selectedRequest.companies?.company_name}</p>
											<p className="text-xs text-muted-foreground">{selectedRequest.companies?.contact_name}</p>
										</div>

										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.hiringRequests.details.contactEmail")}
											</label>
											<div className="mt-1 flex items-center gap-2">
												<Mail className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">{selectedRequest.companies?.email}</span>
											</div>
										</div>

										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.hiringRequests.details.role")}
											</label>
											<p className="text-sm mt-1">{selectedRequest.roles_needed}</p>
										</div>

										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.hiringRequests.details.projectType")}
											</label>
											<p className="text-sm mt-1">
												<Badge variant="outline">{selectedRequest.project_type}</Badge>
											</p>
										</div>

										{selectedRequest.budget_range && (
											<div>
												<label className="text-sm font-medium text-muted-foreground">
													{t("dashboard.hiringRequests.details.budget")}
												</label>
												<p className="text-sm mt-1">{selectedRequest.budget_range}</p>
											</div>
										)}

										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.hiringRequests.details.createdDate")}
											</label>
											<p className="text-sm mt-1">{formatDate(selectedRequest.created_at)}</p>
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.hiringRequests.details.projectDescription")}
										</label>
										<p className="text-sm mt-1 whitespace-pre-wrap">{selectedRequest.project_description}</p>
									</div>

									{/* Matched Talent Section */}
									{selectedRequest.matched_talent_id && (
										<div className="border-t pt-4">
											<h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
												<UserCheck className="h-4 w-4" />
												{t("dashboard.hiringRequests.details.matchedTalent")}
											</h4>
											{(() => {
												const matchedTalent = talents.find((t) => t.id === selectedRequest.matched_talent_id);
												return matchedTalent ? (
													<div className="space-y-3 bg-muted/50 rounded-lg p-4">
														<div className="grid grid-cols-2 gap-4">
															<div>
																<label className="text-xs font-medium text-muted-foreground">
																	{t("dashboard.talents.table.name")}
																</label>
																<p className="text-sm mt-1 font-medium">{matchedTalent.name}</p>
															</div>
															<div>
																<label className="text-xs font-medium text-muted-foreground">
																	{t("dashboard.talents.table.role")}
																</label>
																<p className="text-sm mt-1">{matchedTalent.role}</p>
															</div>
															<div>
																<label className="text-xs font-medium text-muted-foreground">
																	{t("dashboard.talents.table.email")}
																</label>
																<a
																	href={`mailto:${matchedTalent.email}`}
																	className="text-sm mt-1 text-blue-600 hover:underline flex items-center gap-1"
																>
																	<Mail className="h-3 w-3" />
																	{matchedTalent.email}
																</a>
															</div>
															{matchedTalent.phone_number && (
																<div>
																	<label className="text-xs font-medium text-muted-foreground">
																		{t("dashboard.talents.table.phone")}
																	</label>
																	<a
																		href={`tel:${matchedTalent.country_code}${matchedTalent.phone_number}`}
																		className="text-sm mt-1 text-blue-600 hover:underline flex items-center gap-1"
																	>
																		<Phone className="h-3 w-3" />
																		{matchedTalent.country_code} {matchedTalent.phone_number}
																	</a>
																</div>
															)}
															<div>
																<label className="text-xs font-medium text-muted-foreground">
																	{t("dashboard.talents.table.englishLevel")}
																</label>
																<p className="text-sm mt-1">
																	<Badge variant="outline" className="text-xs">
																		{matchedTalent.english_level}
																	</Badge>
																</p>
															</div>
															{selectedRequest.matched_at && (
																<div>
																	<label className="text-xs font-medium text-muted-foreground">
																		{t("dashboard.hiringRequests.details.matchedDate")}
																	</label>
																	<p className="text-sm mt-1">{formatDate(selectedRequest.matched_at)}</p>
																</div>
															)}
														</div>
														{matchedTalent.cv_url && (
															<div className="pt-2 border-t">
																<a
																	href={matchedTalent.cv_url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-sm text-blue-600 hover:underline flex items-center gap-1"
																>
																	<FileText className="h-4 w-4" />
																	{t("dashboard.talents.table.viewCV")}
																	<ExternalLink className="h-3 w-3" />
																</a>
															</div>
														)}
													</div>
												) : (
													<p className="text-sm text-muted-foreground">
														{t("dashboard.hiringRequests.details.talentNotFound")}
													</p>
												);
											})()}
										</div>
									)}
								</div>
							)}
						</DialogContent>
					</Dialog>

					{/* Status Update Confirmation Dialog */}
					<Dialog
						open={statusConfirmDialog?.isOpen || false}
						onOpenChange={(open) => !open && setStatusConfirmDialog(null)}
					>
						<DialogContent className="max-w-md">
							<DialogHeader>
								<DialogTitle>{t("dashboard.status.confirm.title")}</DialogTitle>
								<DialogDescription>{t("dashboard.status.confirm.description")}</DialogDescription>
							</DialogHeader>
							{statusConfirmDialog && (
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<p className="text-sm">
											<span className="font-medium">
												{statusConfirmDialog.type === "talent"
													? t("dashboard.talents.table.name")
													: t("dashboard.companies.table.companyName")}
												:
											</span>{" "}
											{statusConfirmDialog.name}
										</p>
										<div className="flex items-center gap-2 text-sm">
											<span className="font-medium">{t("dashboard.status.confirm.currentStatus")}:</span>
											<Badge variant="secondary">
												{t(
													`dashboard.status.${statusConfirmDialog.type}.${statusConfirmDialog.currentStatus
														.toString()
														.split("_")
														.map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
														.join("")}`
												)}
											</Badge>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<span className="font-medium">{t("dashboard.status.confirm.newStatus")}:</span>
											<Badge
												variant={
													statusConfirmDialog.newStatus === "matched"
														? "default"
														: statusConfirmDialog.newStatus === "rejected"
														? "destructive"
														: "secondary"
												}
											>
												{t(
													`dashboard.status.${statusConfirmDialog.type}.${statusConfirmDialog.newStatus
														.toString()
														.split("_")
														.map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
														.join("")}`
												)}
											</Badge>
										</div>
									</div>
								</div>
							)}
							<div className="flex justify-end gap-3">
								<Button variant="outline" onClick={() => setStatusConfirmDialog(null)}>
									{t("dashboard.status.confirm.cancel")}
								</Button>
								<Button onClick={confirmStatusUpdate}>{t("dashboard.status.confirm.confirm")}</Button>
							</div>
						</DialogContent>
					</Dialog>

					{/* Match Talent Dialog */}
					<Dialog open={matchDialog?.isOpen || false} onOpenChange={(open) => !open && setMatchDialog(null)}>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>{t("dashboard.hiringRequests.match.dialogTitle")}</DialogTitle>
								<DialogDescription>{t("dashboard.hiringRequests.match.dialogDescription")}</DialogDescription>
							</DialogHeader>
							{matchDialog && (
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<p className="text-sm">
											<span className="font-medium">
												{t("dashboard.hiringRequests.table.requestTitle")}:
											</span>{" "}
											{matchDialog.requestTitle}
										</p>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium">
											{t("dashboard.hiringRequests.match.selectTalent")}
										</label>
										{isLoadingTalents ? (
											<div className="flex items-center justify-center py-8">
												<div className="text-sm text-muted-foreground">
													{t("dashboard.hiringRequests.match.matching")}
												</div>
											</div>
										) : availableTalents.length === 0 ? (
											<div className="flex flex-col items-center justify-center py-8 text-center">
												<Users className="h-12 w-12 text-muted-foreground mb-2" />
												<p className="text-sm font-medium">
													{t("dashboard.hiringRequests.match.noTalentsAvailable")}
												</p>
												<p className="text-xs text-muted-foreground mt-1">
													{t("dashboard.hiringRequests.match.noTalentsAvailableDesc")}
												</p>
											</div>
										) : (
											<Select value={selectedTalentId} onValueChange={setSelectedTalentId}>
												<SelectTrigger>
													<SelectValue
														placeholder={t("dashboard.hiringRequests.match.selectTalentPlaceholder")}
													/>
												</SelectTrigger>
												<SelectContent>
													{availableTalents.map((talent) => (
														<SelectItem key={talent.id} value={talent.id}>
															<div className="flex flex-col py-1">
																<span className="font-medium">{talent.name}</span>
																<span className="text-xs text-muted-foreground">
																	{talent.role} • {talent.english_level}
																</span>
															</div>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}

										{selectedTalentId && (
											<div className="mt-4 p-4 border rounded-lg bg-muted/50">
												<p className="text-sm font-medium mb-2">
													{t("dashboard.hiringRequests.match.talentInfo")}
												</p>
												{availableTalents
													.filter((t) => t.id === selectedTalentId)
													.map((talent) => (
														<div key={talent.id} className="space-y-2 text-sm">
															<div>
																<span className="text-muted-foreground">
																	{t("dashboard.talents.table.name")}:
																</span>{" "}
																<span className="font-medium">{talent.name}</span>
															</div>
															<div>
																<span className="text-muted-foreground">
																	{t("dashboard.talents.table.role")}:
																</span>{" "}
																{talent.role}
															</div>
															<div>
																<span className="text-muted-foreground">
																	{t("dashboard.talents.table.englishLevel")}:
																</span>{" "}
																{talent.english_level}
															</div>
															{talent.tools && (
																<div>
																	<span className="text-muted-foreground">
																		{t("dashboard.talents.table.tools")}:
																	</span>{" "}
																	{talent.tools}
																</div>
															)}
														</div>
													))}
											</div>
										)}
									</div>
								</div>
							)}
							<div className="flex justify-end gap-3">
								<Button variant="outline" onClick={() => setMatchDialog(null)} disabled={isMatching}>
									{t("dashboard.hiringRequests.match.cancelButton")}
								</Button>
								<Button onClick={handleConfirmMatch} disabled={!selectedTalentId || isMatching}>
									{isMatching
										? t("dashboard.hiringRequests.match.matching")
										: t("dashboard.hiringRequests.match.confirmButton")}
								</Button>
							</div>
						</DialogContent>
					</Dialog>

					{/* Unmatch Talent Confirmation Dialog */}
					<Dialog
						open={unmatchDialog?.isOpen || false}
						onOpenChange={(open) => !open && setUnmatchDialog(null)}
					>
						<DialogContent className="max-w-md">
							<DialogHeader>
								<DialogTitle>{t("dashboard.hiringRequests.unmatch.dialogTitle")}</DialogTitle>
								<DialogDescription>
									{t("dashboard.hiringRequests.unmatch.dialogDescription")}
								</DialogDescription>
							</DialogHeader>
							{unmatchDialog && (
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<p className="text-sm">
											<span className="font-medium">
												{t("dashboard.hiringRequests.table.requestTitle")}:
											</span>{" "}
											{unmatchDialog.requestTitle}
										</p>
										<p className="text-sm">
											<span className="font-medium">
												{t("dashboard.hiringRequests.unmatch.currentMatch")}:
											</span>{" "}
											{unmatchDialog.talentName}
										</p>
									</div>
									<div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-900">
										<p className="text-sm text-yellow-800 dark:text-yellow-200">
											{t("dashboard.hiringRequests.unmatch.warning")}
										</p>
									</div>
								</div>
							)}
							<div className="flex justify-end gap-3">
								<Button variant="outline" onClick={() => setUnmatchDialog(null)} disabled={isUnmatching}>
									{t("dashboard.hiringRequests.unmatch.cancelButton")}
								</Button>
								<Button variant="destructive" onClick={handleConfirmUnmatch} disabled={isUnmatching}>
									{isUnmatching
										? t("dashboard.hiringRequests.unmatch.unmatching")
										: t("dashboard.hiringRequests.unmatch.confirmButton")}
								</Button>
							</div>
						</DialogContent>
					</Dialog>

					{/* Image Preview Dialog */}
					<Dialog open={imagePreview?.isOpen || false} onOpenChange={() => setImagePreview(null)}>
						<DialogContent className="max-w-3xl">
							<DialogHeader>
								<DialogTitle>{imagePreview?.talentName}</DialogTitle>
								<DialogDescription>Profile Image</DialogDescription>
							</DialogHeader>
							{imagePreview && (
								<div className="flex justify-center p-4">
									<Image
										src={imagePreview.imageUrl}
										alt={imagePreview.talentName}
										width={500}
										height={500}
										className="rounded-lg object-contain max-h-[70vh]"
									/>
								</div>
							)}
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</>
	);
}
