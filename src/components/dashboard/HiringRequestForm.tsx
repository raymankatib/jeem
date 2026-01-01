"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const projectTypeKeys = ["ongoing", "oneTime", "partTime", "fullTime", "tryBeforeHire"];
const budgetRangeKeys = ["under5k", "5kTo15k", "15kTo50k", "over50k", "notSure"];

const roleOptions = [
	"Vibe Coding Engineer",
	"Software Developer",
	"Content Creator as Engineer",
	"Marketer",
	"SEO & AEO Specialist",
	"Social Media Manager",
	"Lead Generator",
	"Sales Pipelines Builder",
	"Lead Qualifier",
	"Designer",
	"AI Video Creator",
	"Virtual Assistant"
];

interface HiringRequestFormProps {
	companyId: string;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function HiringRequestForm({ companyId, onSuccess, onCancel }: HiringRequestFormProps) {
	const { t } = useTranslation();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		request_title: "",
		roles_needed: "",
		project_type: "",
		budget_range: "",
		project_description: ""
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Client-side validation
		if (!formData.request_title.trim()) {
			toast.error(t("dashboard.hiringRequests.form.requestTitle.required"));
			return;
		}
		if (!formData.roles_needed) {
			toast.error(t("dashboard.hiringRequests.form.roleNeeded.required"));
			return;
		}
		if (!formData.project_type) {
			toast.error(t("dashboard.hiringRequests.form.projectType.required"));
			return;
		}
		if (!formData.project_description.trim()) {
			toast.error(t("dashboard.hiringRequests.form.projectDescription.required"));
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/hiring-requests", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					company_id: companyId,
					...formData
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || t("dashboard.hiringRequests.form.error"));
			}

			toast.success(t("dashboard.hiringRequests.form.success"));

			// Reset form
			setFormData({
				request_title: "",
				roles_needed: "",
				project_type: "",
				budget_range: "",
				project_description: ""
			});

			onSuccess?.();
		} catch (error) {
			console.error("Error creating hiring request:", error);
			toast.error(error instanceof Error ? error.message : t("dashboard.hiringRequests.form.errorGeneric"));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			{/* Request Title */}
			<div className="space-y-2">
				<label className="text-sm font-medium">
					{t("dashboard.hiringRequests.form.requestTitle.label")} <span className="text-destructive">*</span>
				</label>
				<Input
					placeholder={t("dashboard.hiringRequests.form.requestTitle.placeholder")}
					value={formData.request_title}
					onChange={(e) => setFormData({ ...formData, request_title: e.target.value })}
					disabled={isSubmitting}
					autoFocus
				/>
				<p className="text-xs text-muted-foreground">{t("dashboard.hiringRequests.form.requestTitle.hint")}</p>
			</div>

			{/* Role & Project Type */}
			<div className="grid sm:grid-cols-2 gap-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">
						{t("dashboard.hiringRequests.form.roleNeeded.label")} <span className="text-destructive">*</span>
					</label>
					<Select
						value={formData.roles_needed}
						onValueChange={(value) => setFormData({ ...formData, roles_needed: value })}
						disabled={isSubmitting}
					>
						<SelectTrigger>
							<SelectValue placeholder={t("dashboard.hiringRequests.form.roleNeeded.placeholder")} />
						</SelectTrigger>
						<SelectContent>
							{roleOptions.map((role) => (
								<SelectItem key={role} value={role}>
									{role}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">
						{t("dashboard.hiringRequests.form.projectType.label")} <span className="text-destructive">*</span>
					</label>
					<Select
						value={formData.project_type}
						onValueChange={(value) => setFormData({ ...formData, project_type: value })}
						disabled={isSubmitting}
					>
						<SelectTrigger>
							<SelectValue placeholder={t("dashboard.hiringRequests.form.projectType.placeholder")} />
						</SelectTrigger>
						<SelectContent>
							{projectTypeKeys.map((type) => (
								<SelectItem key={type} value={type}>
									{t(`hire.applicationForm.fields.projectType.options.${type}`)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Budget Range */}
			<div className="space-y-2">
				<label className="text-sm font-medium">
					{t("dashboard.hiringRequests.form.budgetRange.labelOptional")}
				</label>
				<Select
					value={formData.budget_range}
					onValueChange={(value) => setFormData({ ...formData, budget_range: value })}
					disabled={isSubmitting}
				>
					<SelectTrigger>
						<SelectValue placeholder={t("dashboard.hiringRequests.form.budgetRange.placeholder")} />
					</SelectTrigger>
					<SelectContent>
						{budgetRangeKeys.map((range) => (
							<SelectItem key={range} value={range}>
								{t(`hire.applicationForm.fields.budgetRange.options.${range}`)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Project Description */}
			<div className="space-y-2">
				<label className="text-sm font-medium">
					{t("dashboard.hiringRequests.form.projectDescription.label")} <span className="text-destructive">*</span>
				</label>
				<Textarea
					placeholder={t("dashboard.hiringRequests.form.projectDescription.placeholder")}
					rows={6}
					value={formData.project_description}
					onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
					disabled={isSubmitting}
					className="resize-none"
				/>
				<p className="text-xs text-muted-foreground">
					{t("dashboard.hiringRequests.form.projectDescription.hint")}
				</p>
			</div>

			{/* Actions */}
			<div className="flex gap-3 justify-end pt-4 border-t">
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
						{t("dashboard.hiringRequests.form.cancel")}
					</Button>
				)}
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
							{t("dashboard.hiringRequests.form.submitting")}
						</>
					) : (
						t("dashboard.hiringRequests.form.submit")
					)}
				</Button>
			</div>
		</form>
	);
}
