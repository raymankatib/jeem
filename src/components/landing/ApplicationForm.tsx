"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const roleOptions: Array<{ value: string; labelKey: string }> = [
	{ value: "Vibe Coding Engineer", labelKey: "roles.categories.engineering.roles.vibeCodingEngineer.title" },
	{ value: "Software Developer", labelKey: "roles.categories.engineering.roles.softwareDeveloper.title" },
	{ value: "Content Creator as Engineer", labelKey: "roles.categories.engineering.roles.contentCreatorEngineer.title" },
	{ value: "Marketer", labelKey: "roles.categories.growth.roles.marketer.title" },
	{ value: "SEO & AEO Specialist", labelKey: "roles.categories.growth.roles.seoAeoSpecialist.title" },
	{ value: "Social Media Manager", labelKey: "roles.categories.growth.roles.socialMediaManager.title" },
	{ value: "Lead Generator", labelKey: "roles.categories.revenue.roles.leadGenerator.title" },
	{ value: "Sales Pipelines Builder", labelKey: "roles.categories.revenue.roles.salesPipelinesBuilder.title" },
	{ value: "Lead Qualifier", labelKey: "roles.categories.revenue.roles.leadQualifier.title" },
	{ value: "Designer", labelKey: "roles.categories.creative.roles.designer.title" },
	{ value: "AI Video Creator", labelKey: "roles.categories.creative.roles.aiVideoCreator.title" },
	{ value: "Virtual Assistant", labelKey: "roles.categories.operations.roles.virtualAssistant.title" }
];

const englishLevelKeys = ["native", "fluent", "advanced", "intermediate", "basic"];

interface UTMParams {
	utm_source: string;
	utm_medium: string;
	utm_campaign: string;
	utm_term: string;
	utm_content: string;
}

export function ApplicationForm() {
	const { t, i18n } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const isRTL = i18n.language === "ar";
	const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

	// UTM parameters from URL
	const [utmParams, setUtmParams] = useState<UTMParams>({
		utm_source: "",
		utm_medium: "",
		utm_campaign: "",
		utm_term: "",
		utm_content: ""
	});

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		role: "",
		englishLevel: "",
		portfolio: "",
		shipped: "",
		tools: "",
		honey: "" // Honeypot field
	});

	// Extract UTM parameters from URL on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			setUtmParams({
				utm_source: params.get("utm_source") || "",
				utm_medium: params.get("utm_medium") || "",
				utm_campaign: params.get("utm_campaign") || "",
				utm_term: params.get("utm_term") || "",
				utm_content: params.get("utm_content") || ""
			});
		}
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Client-side validation
		if (!formData.name.trim()) {
			toast.error(t("applicationForm.validation.nameRequired"));
			return;
		}
		if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			toast.error(t("applicationForm.validation.emailInvalid"));
			return;
		}
		if (!formData.role) {
			toast.error(t("applicationForm.validation.roleRequired"));
			return;
		}
		if (!formData.englishLevel) {
			toast.error(t("applicationForm.validation.englishLevelRequired"));
			return;
		}
		if (!formData.portfolio.trim()) {
			toast.error(t("applicationForm.validation.portfolioRequired"));
			return;
		}
		if (!formData.shipped.trim()) {
			toast.error(t("applicationForm.validation.shippedRequired"));
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/talents", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					...formData,
					...utmParams,
					page_path: typeof window !== "undefined" ? window.location.pathname : "",
					language: i18n.language // Send current language for email
				})
			});

			const result = await response.json();

			if (!response.ok) {
				// Handle specific error cases
				if (response.status === 429) {
					toast.error(t("applicationForm.errors.rateLimit"));
				} else if (response.status === 400 && result.details) {
					// Show first validation error
					const firstError = Object.values(result.details)[0];
					toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
				} else {
					toast.error(result.error || t("applicationForm.errors.generic"));
				}
				return;
			}

			// Success!
			setIsSubmitted(true);
			toast.success(t("applicationForm.success.title"), {
				description: t("applicationForm.success.description")
			});

			// Reset form
			setFormData({
				name: "",
				email: "",
				role: "",
				englishLevel: "",
				portfolio: "",
				shipped: "",
				tools: "",
				honey: ""
			});
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error(t("applicationForm.errors.network"));
		} finally {
			setIsSubmitting(false);
		}
	};

	// Success state UI
	if (isSubmitted) {
		return (
			<section id="apply" className="py-32 relative bg-foreground text-background" ref={ref}>
				<div
					className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
					}}
				/>
				<div className="container-narrow relative">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="text-center max-w-lg mx-auto"
					>
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-6">
							<CheckCircle2 className="w-8 h-8 text-green-400" />
						</div>
						<h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
							{t("applicationForm.success.title")}
						</h2>
						<p className="text-background/70 text-lg">{t("applicationForm.success.description")}</p>
					</motion.div>
				</div>
			</section>
		);
	}

	return (
		<section id="apply" className="py-32 relative bg-foreground text-background" ref={ref}>
			{/* Subtle noise texture */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
				}}
			/>

			<div className="container-narrow relative">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Two-column layout */}
					<div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
						{/* Left Column - Header */}
						<motion.div variants={fadeInUp} className="lg:col-span-5">
							<p className="text-sm text-background/60 uppercase tracking-wider mb-3">
								{t("applicationForm.sectionLabel")}
							</p>
							<h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
								{t("applicationForm.title")}
							</h2>
							<p className="text-background/70 text-lg leading-relaxed mb-8">{t("applicationForm.description")}</p>

							{/* Quick stats or trust signals */}
							<div className="space-y-4 text-sm text-background/60">
								<div className="flex items-center gap-3">
									<div className="w-1.5 h-1.5 rounded-full bg-background/40" />
									<span>{t("applicationForm.trustSignals.respond")}</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-1.5 h-1.5 rounded-full bg-background/40" />
									<span>{t("applicationForm.trustSignals.responseTime")}</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-1.5 h-1.5 rounded-full bg-background/40" />
									<span>{t("applicationForm.trustSignals.noFee")}</span>
								</div>
							</div>
						</motion.div>

						{/* Right Column - Form */}
						<motion.div variants={fadeInUp} className="lg:col-span-7">
							<form onSubmit={handleSubmit} className="space-y-5">
								{/* Honeypot field - hidden from real users, bots will fill it */}
								<div className="absolute -left-[9999px]" aria-hidden="true">
									<label htmlFor="honey">Leave this empty</label>
									<input
										type="text"
										id="honey"
										name="honey"
										tabIndex={-1}
										autoComplete="off"
										value={formData.honey}
										onChange={(e) => setFormData({ ...formData, honey: e.target.value })}
									/>
								</div>

								{/* Name & Email - Two columns */}
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label htmlFor="name" className="text-sm text-background/70">
											{t("applicationForm.fields.name.label")} <span className="text-background/40">*</span>
										</label>
										<Input
											id="name"
											type="text"
											placeholder={t("applicationForm.fields.name.placeholder")}
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
											disabled={isSubmitting}
										/>
									</div>

									<div className="space-y-2">
										<label htmlFor="email" className="text-sm text-background/70">
											{t("applicationForm.fields.email.label")} <span className="text-background/40">*</span>
										</label>
										<Input
											id="email"
											type="email"
											placeholder={t("applicationForm.fields.email.placeholder")}
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
											disabled={isSubmitting}
										/>
									</div>
								</div>

								{/* Role & English Level */}
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label htmlFor="role" className="text-sm text-background/70">
											{t("applicationForm.fields.role.label")} <span className="text-background/40">*</span>
										</label>
										<Select
											value={formData.role}
											onValueChange={(value) => setFormData({ ...formData, role: value })}
											disabled={isSubmitting}
										>
											<SelectTrigger className="w-full bg-background/5 border-background/10 text-background focus:border-background/30 h-11 [&>span]:text-background/70">
												<SelectValue placeholder={t("applicationForm.fields.role.placeholder")} />
											</SelectTrigger>
											<SelectContent>
												{roleOptions.map((role) => (
													<SelectItem key={role.value} value={role.value}>
														{t(role.labelKey)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<label htmlFor="englishLevel" className="text-sm text-background/70">
											{t("applicationForm.fields.englishLevel.label")} <span className="text-background/40">*</span>
										</label>
										<Select
											value={formData.englishLevel}
											onValueChange={(value) => setFormData({ ...formData, englishLevel: value })}
											disabled={isSubmitting}
										>
											<SelectTrigger className="w-full bg-background/5 border-background/10 text-background focus:border-background/30 h-11 [&>span]:text-background/70">
												<SelectValue placeholder={t("applicationForm.fields.englishLevel.placeholder")} />
											</SelectTrigger>
											<SelectContent>
												{englishLevelKeys.map((level) => (
													<SelectItem key={level} value={level}>
														{t(`applicationForm.fields.englishLevel.options.${level}`)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								{/* Portfolio */}
								<div className="space-y-2">
									<label htmlFor="portfolio" className="text-sm text-background/70">
										{t("applicationForm.fields.portfolio.label")} <span className="text-background/40">*</span>
									</label>
									<Input
										id="portfolio"
										type="url"
										placeholder={t("applicationForm.fields.portfolio.placeholder")}
										value={formData.portfolio}
										onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
										className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
										disabled={isSubmitting}
									/>
								</div>

								{/* What you've shipped */}
								<div className="space-y-2">
									<label htmlFor="shipped" className="text-sm text-background/70">
										{t("applicationForm.fields.shipped.label")} <span className="text-background/40">*</span>
									</label>
									<Textarea
										id="shipped"
										placeholder={t("applicationForm.fields.shipped.placeholder")}
										rows={4}
										value={formData.shipped}
										onChange={(e) => setFormData({ ...formData, shipped: e.target.value })}
										className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 resize-none"
										disabled={isSubmitting}
									/>
								</div>

								{/* Tools (optional) */}
								<div className="space-y-2">
									<label htmlFor="tools" className="text-sm text-background/70">
										{t("applicationForm.fields.tools.label")}{" "}
										<span className="text-background/40">{t("common.optional")}</span>
									</label>
									<Input
										id="tools"
										type="text"
										placeholder={t("applicationForm.fields.tools.placeholder")}
										value={formData.tools}
										onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
										className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
										disabled={isSubmitting}
									/>
								</div>

								{/* Submit */}
								<div className="pt-4">
									<Button
										type="submit"
										size="lg"
										disabled={isSubmitting}
										className="w-full sm:w-auto bg-background hover:bg-background/90 text-foreground font-medium h-12 px-10 transition-opacity duration-200 gap-2"
									>
										{isSubmitting ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												{t("applicationForm.submit.sending")}
											</>
										) : (
											<>
												{t("applicationForm.submit.button")}
												<ArrowIcon className="h-4 w-4" />
											</>
										)}
									</Button>
								</div>

								{/* Privacy note */}
								<p className="text-xs text-background/40 pt-2">{t("applicationForm.privacyNote")}</p>
							</form>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
