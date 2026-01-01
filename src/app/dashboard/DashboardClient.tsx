"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
	LogOut,
	Mail,
	ExternalLink,
	FileText,
	Calendar,
	User as UserIcon,
	Building2,
	Briefcase,
	DollarSign,
	Phone,
	Plus,
	UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { User } from "@supabase/supabase-js";
import { AuthNav } from "@/components/auth-nav";
import { HiringRequestForm } from "@/components/dashboard/HiringRequestForm";

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
	email_status: string | null;
	application_status: TalentStatus;
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

export interface HiringRequest {
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
	matched_at?: string | null;
	matched_talent_id?: string | null;
	matched_talent?: {
		id: string;
		name: string;
		email: string;
		role: string;
		portfolio: string;
		english_level: string;
	} | null;
	companies?: {
		id: string;
		company_name: string;
		contact_name: string;
		email: string;
		website?: string | null;
	};
}

interface DashboardClientProps {
	user: User;
	talentProfile: Talent | null;
	companyProfile: Company | null;
	hiringRequests?: HiringRequest[];
	matchedHiringRequest?: HiringRequest | null;
}

export default function DashboardClient({
	user,
	talentProfile,
	companyProfile,
	hiringRequests = [],
	matchedHiringRequest = null
}: DashboardClientProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const [showCreateRequestDialog, setShowCreateRequestDialog] = useState(false);

	// Auto-open dialog when redirected from registration
	useEffect(() => {
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			if (params.get("createRequest") === "true" && companyProfile) {
				setTimeout(() => {
					setShowCreateRequestDialog(true);
				}, 0);
				// Clean up URL without reload
				window.history.replaceState({}, "", "/dashboard");
			}
		}
	}, [companyProfile]);

	const handleLogout = async () => {
		const supabase = createClient();
		const { error } = await supabase.auth.signOut();

		if (error) {
			toast.error(t("auth.logout.error"));
			return;
		}

		toast.success(t("auth.logout.success"));
		// Redirect company accounts to /hire, others to home
		router.push(companyProfile ? "/hire" : "/");
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

	return (
		<>
			<AuthNav />
			<div className="min-h-screen bg-background pt-24 p-8">
				<div className="max-w-4xl mx-auto">
					<div className="flex justify-between items-center mb-8">
						<div>
							<h1 className="text-3xl font-semibold tracking-tight mb-2">{t("dashboard.userProfile.title")}</h1>
							<p className="text-muted-foreground">{t("dashboard.userProfile.subtitle")}</p>
						</div>
						<Button variant="outline" onClick={handleLogout}>
							<LogOut className="h-4 w-4 me-2" />
							{t("auth.logout.button")}
						</Button>
					</div>

					{/* Talent Profile */}
					{talentProfile && (
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="p-2 bg-primary/10 rounded-lg">
										<UserIcon className="h-6 w-6" />
									</div>
									<div>
										<CardTitle>{talentProfile.name}</CardTitle>
										<CardDescription>{talentProfile.role}</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.talents.details.email")}
										</label>
										<div className="mt-1 flex items-center gap-2">
											<Mail className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">{talentProfile.email}</span>
										</div>
									</div>

									{talentProfile.phone_number && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.details.phone")}
											</label>
											<div className="mt-1 flex items-center gap-2">
												<Phone className="h-4 w-4 text-muted-foreground" />
												<a
													href={`tel:${talentProfile.country_code}${talentProfile.phone_number}`}
													className="text-sm hover:underline"
												>
													{talentProfile.country_code} {talentProfile.phone_number}
												</a>
											</div>
										</div>
									)}

									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.talents.details.applicationStatus")}
										</label>
										<div className="mt-1">
											<Badge
												variant={
													talentProfile.application_status === "matched"
														? "default"
														: talentProfile.application_status === "rejected"
														? "destructive"
														: "secondary"
												}
											>
												{t(
													`dashboard.status.talent.${talentProfile.application_status
														.split("_")
														.map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
														.join("")}`
												)}
											</Badge>
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.talents.details.englishLevel")}
										</label>
										<p className="mt-1 text-sm">{talentProfile.english_level}</p>
									</div>

									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.talents.details.portfolio")}
										</label>
										<div className="mt-1">
											<a
												href={talentProfile.portfolio}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-blue-600 hover:underline flex items-center gap-1"
											>
												{talentProfile.portfolio}
												<ExternalLink className="h-3 w-3" />
											</a>
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.talents.details.shipped")}
										</label>
										<p className="mt-1 text-sm">{talentProfile.shipped}</p>
									</div>

									{talentProfile.tools && (
										<div className="col-span-full">
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.details.tools")}
											</label>
											<p className="mt-1 text-sm">{talentProfile.tools}</p>
										</div>
									)}

									{talentProfile.cv_url && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.details.cv")}
											</label>
											<div className="mt-1 flex items-center gap-3">
												<a
													href={talentProfile.cv_url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm text-blue-600 hover:underline flex items-center gap-1"
												>
													<FileText className="h-4 w-4" />
													{talentProfile.cv_filename || "CV.pdf"}
													<ExternalLink className="h-3 w-3" />
												</a>
											</div>
										</div>
									)}

									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.talents.details.submittedOn")}
										</label>
										<div className="mt-1 flex items-center gap-2">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">{formatDate(talentProfile.created_at)}</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Matched Project Section (for talents) */}
					{talentProfile && matchedHiringRequest && (
						<Card className="mt-6 border-2 border-primary/20">
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="p-2 bg-primary/10 rounded-lg">
										<Briefcase className="h-6 w-6 text-primary" />
									</div>
									<div>
										<CardTitle>{t("dashboard.talents.matchedProject.title")}</CardTitle>
										<CardDescription>{t("dashboard.talents.matchedProject.description")}</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="col-span-full">
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.hiringRequests.table.title")}
										</label>
										<p className="mt-1 text-lg font-semibold">{matchedHiringRequest.request_title}</p>
									</div>

									{matchedHiringRequest.companies && (
										<>
											<div>
												<label className="text-sm font-medium text-muted-foreground">
													{t("dashboard.companies.details.companyName")}
												</label>
												<div className="mt-1 flex items-center gap-2">
													<Building2 className="h-4 w-4 text-muted-foreground" />
													<span className="text-sm font-medium">{matchedHiringRequest.companies.company_name}</span>
												</div>
											</div>

											<div>
												<label className="text-sm font-medium text-muted-foreground">
													{t("dashboard.companies.details.contactName")}
												</label>
												<div className="mt-1 flex items-center gap-2">
													<UserIcon className="h-4 w-4 text-muted-foreground" />
													<span className="text-sm">{matchedHiringRequest.companies.contact_name}</span>
												</div>
											</div>

											{matchedHiringRequest.companies.website && (
												<div>
													<label className="text-sm font-medium text-muted-foreground">
														{t("dashboard.companies.details.website")}
													</label>
													<div className="mt-1">
														<a
															href={matchedHiringRequest.companies.website}
															target="_blank"
															rel="noopener noreferrer"
															className="text-sm text-blue-600 hover:underline flex items-center gap-1"
														>
															{matchedHiringRequest.companies.website}
															<ExternalLink className="h-3 w-3" />
														</a>
													</div>
												</div>
											)}
										</>
									)}

									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.hiringRequests.table.roles")}
										</label>
										<p className="mt-1 text-sm">{matchedHiringRequest.roles_needed}</p>
									</div>

									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.hiringRequests.table.projectType")}
										</label>
										<p className="mt-1 text-sm">
											{t(`hire.applicationForm.fields.projectType.options.${matchedHiringRequest.project_type}`)}
										</p>
									</div>

									{matchedHiringRequest.matched_at && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.talents.details.matchedDate")}
											</label>
											<div className="mt-1 flex items-center gap-2">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">{formatDate(matchedHiringRequest.matched_at)}</span>
											</div>
										</div>
									)}

									<div className="col-span-full">
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.hiringRequests.table.description")}
										</label>
										<p className="mt-1 text-sm whitespace-pre-wrap">{matchedHiringRequest.project_description}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Company Profile */}
					{companyProfile && (
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="p-2 bg-primary/10 rounded-lg">
										<Building2 className="h-6 w-6" />
									</div>
									<div>
										<CardTitle>{companyProfile.company_name}</CardTitle>
										<CardDescription>{companyProfile.contact_name}</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.companies.details.email")}
										</label>
										<div className="mt-1 flex items-center gap-2">
											<Mail className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">{companyProfile.email}</span>
										</div>
									</div>

									{companyProfile.phone_number && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.companies.details.phone")}
											</label>
											<div className="mt-1 flex items-center gap-2">
												<Phone className="h-4 w-4 text-muted-foreground" />
												<a
													href={`tel:${companyProfile.country_code}${companyProfile.phone_number}`}
													className="text-sm hover:underline"
												>
													{companyProfile.country_code} {companyProfile.phone_number}
												</a>
											</div>
										</div>
									)}

									{companyProfile.website && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												{t("dashboard.companies.details.website")}
											</label>
											<div className="mt-1">
												<a
													href={companyProfile.website}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm text-blue-600 hover:underline flex items-center gap-1"
												>
													{companyProfile.website}
													<ExternalLink className="h-3 w-3" />
												</a>
											</div>
										</div>
									)}

									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.companies.details.companySize")}
										</label>
										<p className="mt-1 text-sm">{companyProfile.company_size}</p>
									</div>

									{/* REMOVED: projectType, rolesNeeded, budgetRange, projectDescription */}
									{/* These are now managed via hiring requests */}

									<div>
										<label className="text-sm font-medium text-muted-foreground">
											{t("dashboard.companies.details.submittedOn")}
										</label>
										<div className="mt-1 flex items-center gap-2">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">{formatDate(companyProfile.created_at)}</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Hiring Requests Section (for companies) */}
					{companyProfile && (
						<Card className="mt-6">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>{t("dashboard.hiringRequests.title")}</CardTitle>
										<CardDescription>{t("dashboard.hiringRequests.description")}</CardDescription>
									</div>
									<Button onClick={() => setShowCreateRequestDialog(true)}>
										<Plus className="h-4 w-4 mr-2" />
										{t("dashboard.hiringRequests.newRequest")}
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								{hiringRequests.length === 0 ? (
									<div className="text-center py-12">
										<Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<h3 className="text-lg font-semibold mb-2">{t("dashboard.hiringRequests.empty")}</h3>
										<p className="text-muted-foreground mb-4">{t("dashboard.hiringRequests.emptyDescription")}</p>
										<Button variant="outline" onClick={() => setShowCreateRequestDialog(true)}>
											<Plus className="h-4 w-4 mr-2" />
											{t("dashboard.hiringRequests.createFirst")}
										</Button>
									</div>
								) : (
									<div className="space-y-4">
										{hiringRequests.map((request) => (
											<Card key={request.id} className="border-l-4 border-l-primary">
												<CardHeader>
													<div className="flex items-center justify-between">
														<CardTitle className="text-lg">{request.request_title}</CardTitle>
														<Badge variant={request.request_status === "filled" ? "default" : "secondary"}>
															{t(`dashboard.hiringRequests.status.${request.request_status}`)}
														</Badge>
													</div>
													<CardDescription>
														{request.roles_needed} •{" "}
														{t(`hire.applicationForm.fields.projectType.options.${request.project_type}`)}
													</CardDescription>
												</CardHeader>
												<CardContent className="space-y-4">
													<p className="text-sm text-muted-foreground line-clamp-2">{request.project_description}</p>

													{/* Matched Talent Details */}
													{request.matched_talent && (
														<div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
															<div className="flex items-center gap-2 mb-3">
																<UserCheck className="h-4 w-4 text-primary" />
																<h4 className="font-semibold text-sm">
																	{t("dashboard.hiringRequests.matchedTalent.title")}
																</h4>
															</div>
															<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
																<div>
																	<label className="text-xs text-muted-foreground">
																		{t("dashboard.talents.details.name")}
																	</label>
																	<p className="font-medium">{request.matched_talent.name}</p>
																</div>
																<div>
																	<label className="text-xs text-muted-foreground">
																		{t("dashboard.talents.details.role")}
																	</label>
																	<p>{request.matched_talent.role}</p>
																</div>
																<div>
																	<label className="text-xs text-muted-foreground">
																		{t("dashboard.talents.details.email")}
																	</label>
																	<a
																		href={`mailto:${request.matched_talent.email}`}
																		className="text-blue-600 hover:underline flex items-center gap-1"
																	>
																		{request.matched_talent.email}
																	</a>
																</div>
																<div>
																	<label className="text-xs text-muted-foreground">
																		{t("dashboard.talents.details.englishLevel")}
																	</label>
																	<p>{request.matched_talent.english_level}</p>
																</div>
																<div className="col-span-full">
																	<label className="text-xs text-muted-foreground">
																		{t("dashboard.talents.details.portfolio")}
																	</label>
																	<a
																		href={request.matched_talent.portfolio}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-blue-600 hover:underline flex items-center gap-1"
																	>
																		{request.matched_talent.portfolio}
																		<ExternalLink className="h-3 w-3" />
																	</a>
																</div>
																{request.updated_at && (
																	<div className="col-span-full pt-2 border-t border-primary/10">
																		<label className="text-xs text-muted-foreground">
																			{t("dashboard.companies.details.matchedDate")}
																		</label>
																		<div className="flex items-center gap-2 mt-1">
																			<Calendar className="h-3 w-3 text-muted-foreground" />
																			{request.matched_at && (
																				<span className="text-sm">{formatDate(request.matched_at)}</span>
																			)}
																		</div>
																	</div>
																)}
															</div>
														</div>
													)}

													<div className="flex items-center gap-4 text-xs text-muted-foreground">
														<div className="flex items-center gap-1">
															<Calendar className="h-3 w-3" />
															<span>
																{t("dashboard.hiringRequests.table.created")} {formatDate(request.created_at)}
															</span>
														</div>
														{request.budget_range && (
															<div className="flex items-center gap-1">
																<DollarSign className="h-3 w-3" />
																<span>
																	{t(`hire.applicationForm.fields.budgetRange.options.${request.budget_range}`)}
																</span>
															</div>
														)}
														<Badge variant="outline" className="text-xs">
															{t(`dashboard.hiringRequests.applicationStatus.${request.application_status}`)}
														</Badge>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* No profile found */}
					{!talentProfile && !companyProfile && (
						<Card>
							<CardContent className="py-12 text-center">
								<UserIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<h3 className="text-lg font-semibold mb-2">No Profile Found</h3>
								<p className="text-muted-foreground">
									Your account is not associated with any talent or company profile yet.
								</p>
							</CardContent>
						</Card>
					)}

					{/* Create Hiring Request Dialog */}
					{companyProfile && (
						<Dialog open={showCreateRequestDialog} onOpenChange={setShowCreateRequestDialog}>
							<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>{t("dashboard.hiringRequests.form.title")}</DialogTitle>
									<DialogDescription>{t("dashboard.hiringRequests.form.description")}</DialogDescription>
								</DialogHeader>
								<HiringRequestForm
									companyId={companyProfile.id}
									onSuccess={() => {
										setShowCreateRequestDialog(false);
										router.refresh();
									}}
									onCancel={() => setShowCreateRequestDialog(false)}
								/>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</div>
		</>
	);
}
