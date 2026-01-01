"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, Check, ChevronsUpDown } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { countryCodes } from "@/lib/country-codes";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const companySizeKeys = ["solo", "small", "medium", "large", "enterprise"];
// REMOVED: projectTypeKeys, budgetRangeKeys, roleOptions
// These are now used in the HiringRequestForm component instead

interface UTMParams {
	utm_source: string;
	utm_medium: string;
	utm_campaign: string;
	utm_term: string;
	utm_content: string;
}

export function CompanyApplicationForm() {
	const { t, i18n } = useTranslation();
	const router = useRouter();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [countryCodeOpen, setCountryCodeOpen] = useState(false);
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
		companyName: "",
		contactName: "",
		email: "",
		countryCode: "+1", // Default to US/Canada
		phoneNumber: "",
		website: "",
		companySize: "",
		// REMOVED: rolesNeeded, projectType, budgetRange, projectDescription
		// These fields are now collected via hiring requests
		honey: "" // Honeypot field
	});

	// Password modal state
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

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
		if (!formData.companyName.trim()) {
			toast.error(t("hire.applicationForm.validation.companyNameRequired"));
			return;
		}
		if (!formData.contactName.trim()) {
			toast.error(t("hire.applicationForm.validation.contactNameRequired"));
			return;
		}
		if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			toast.error(t("hire.applicationForm.validation.emailInvalid"));
			return;
		}
		if (!formData.phoneNumber.trim()) {
			toast.error(t("hire.applicationForm.validation.phoneNumberRequired"));
			return;
		}
		const phoneDigitsOnly = formData.phoneNumber.replace(/\D/g, "");
		if (phoneDigitsOnly.length < 7 || phoneDigitsOnly.length > 15) {
			toast.error(t("hire.applicationForm.validation.phoneNumberInvalid"));
			return;
		}
		if (!formData.companySize) {
			toast.error(t("hire.applicationForm.validation.companySizeRequired"));
			return;
		}
		// REMOVED: validation for rolesNeeded, projectType, projectDescription
		// These are now validated in the hiring request form

		// Show password modal instead of submitting directly
		setShowPasswordModal(true);
	};

	const handlePasswordSubmit = async () => {
		// Validate password
		if (!password || password.length < 8) {
			toast.error(t("hire.applicationForm.validation.passwordTooShort"));
			return;
		}
		if (password !== confirmPassword) {
			toast.error(t("hire.applicationForm.validation.passwordMismatch"));
			return;
		}

		setIsSubmitting(true);
		setShowPasswordModal(false);

		try {
			const response = await fetch("/api/companies", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					...formData,
					...utmParams,
					password: password,
					page_path: typeof window !== "undefined" ? window.location.pathname : "",
					language: i18n.language
				})
			});

			const result = await response.json();

			if (!response.ok) {
				if (response.status === 429) {
					toast.error(t("hire.applicationForm.errors.rateLimit"));
				} else if (response.status === 400 && result.details) {
					const firstError = Object.values(result.details)[0];
					toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
				} else {
					toast.error(result.error || t("hire.applicationForm.errors.generic"));
				}
				return;
			}

			// Success! Now sign in the user automatically
			const supabase = createClient();
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: formData.email,
				password: password
			});

			if (signInError) {
				console.error("Auto sign-in error:", signInError);
				// Show success message but tell them to login manually
				toast.success(t("hire.applicationForm.success.title"), {
					description: t("hire.applicationForm.success.descriptionPleaseLogin")
				});
				// Redirect to login page
				router.push("/login");
				return;
			}

			// Successfully signed in! Show success message
			toast.success(t("hire.applicationForm.success.title"), {
				description: t("hire.applicationForm.success.description")
			});

			// Redirect to dashboard with auto-open dialog for creating first hiring request
			if (result.companyId) {
				router.push(`/dashboard?createRequest=true`);
			} else {
				// Fallback if companyId not returned
				setIsSubmitted(true);
			}

			// Reset form
			setFormData({
				companyName: "",
				contactName: "",
				email: "",
				countryCode: "+1",
				phoneNumber: "",
				website: "",
				companySize: "",
				honey: ""
			});
			setPassword("");
			setConfirmPassword("");
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error(t("hire.applicationForm.errors.network"));
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
							{t("hire.applicationForm.success.title")}
						</h2>
						<p className="text-background/70 text-lg">{t("hire.applicationForm.success.description")}</p>
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
								{t("hire.applicationForm.sectionLabel")}
							</p>
							<h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
								{t("hire.applicationForm.title")}
							</h2>
							<p className="text-background/70 text-lg leading-relaxed mb-8">{t("hire.applicationForm.description")}</p>

							{/* Quick stats or trust signals */}
							<div className="space-y-4 text-sm text-background/60">
								<div className="flex items-center gap-3">
									<div className="w-1.5 h-1.5 rounded-full bg-background/40" />
									<span>{t("hire.applicationForm.trustSignals.respond")}</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-1.5 h-1.5 rounded-full bg-background/40" />
									<span>{t("hire.applicationForm.trustSignals.noCommitment")}</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-1.5 h-1.5 rounded-full bg-background/40" />
									<span>{t("hire.applicationForm.trustSignals.flexibleTerms")}</span>
								</div>
							</div>
						</motion.div>

						{/* Right Column - Form */}
						<motion.div variants={fadeInUp} className="lg:col-span-7">
							<form onSubmit={handleSubmit} className="space-y-5">
								{/* Honeypot field - hidden from real users */}
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

								{/* Company Name & Contact Name */}
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label htmlFor="companyName" className="text-sm text-background/70">
											{t("hire.applicationForm.fields.companyName.label")} <span className="text-background/40">*</span>
										</label>
										<Input
											id="companyName"
											type="text"
											placeholder={t("hire.applicationForm.fields.companyName.placeholder")}
											value={formData.companyName}
											onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
											className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
											disabled={isSubmitting}
										/>
									</div>

									<div className="space-y-2">
										<label htmlFor="contactName" className="text-sm text-background/70">
											{t("hire.applicationForm.fields.contactName.label")} <span className="text-background/40">*</span>
										</label>
										<Input
											id="contactName"
											type="text"
											placeholder={t("hire.applicationForm.fields.contactName.placeholder")}
											value={formData.contactName}
											onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
											className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
											disabled={isSubmitting}
										/>
									</div>
								</div>

								{/* Email & Website */}
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label htmlFor="email" className="text-sm text-background/70">
											{t("hire.applicationForm.fields.email.label")} <span className="text-background/40">*</span>
										</label>
										<Input
											id="email"
											type="email"
											placeholder={t("hire.applicationForm.fields.email.placeholder")}
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
											disabled={isSubmitting}
										/>
									</div>

									<div className="space-y-2">
										<label htmlFor="website" className="text-sm text-background/70">
											{t("hire.applicationForm.fields.website.label")}{" "}
											<span className="text-background/40">{t("common.optional")}</span>
										</label>
										<Input
											id="website"
											type="url"
											placeholder={t("hire.applicationForm.fields.website.placeholder")}
											value={formData.website}
											onChange={(e) => setFormData({ ...formData, website: e.target.value })}
											className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
											disabled={isSubmitting}
										/>
									</div>
								</div>

								{/* Phone Number */}
								<div className="space-y-2">
									<label htmlFor="phoneNumber" className="text-sm text-background/70">
										{t("hire.applicationForm.fields.phoneNumber.label")} <span className="text-background/40">*</span>
									</label>
									<div className="grid grid-cols-[140px_1fr] gap-2">
										<Popover open={countryCodeOpen} onOpenChange={setCountryCodeOpen}>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													role="combobox"
													aria-expanded={countryCodeOpen}
													className="w-full justify-between bg-background/5 border-background/10 text-background hover:bg-background/10 hover:text-background focus:border-background/30 h-11"
													disabled={isSubmitting}
												>
													{formData.countryCode}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-[300px] p-0" align="start">
												<Command>
													<CommandInput placeholder="Search country..." className="h-9" />
													<CommandList>
														<CommandEmpty>No country found.</CommandEmpty>
														<CommandGroup>
															{countryCodes.map((country) => (
																<CommandItem
																	key={`${country.code}-${country.country}`}
																	value={`${country.country} ${country.code}`}
																	onSelect={() => {
																		setFormData({ ...formData, countryCode: country.code });
																		setCountryCodeOpen(false);
																	}}
																>
																	<span className="flex items-center gap-2">
																		<span>{country.flag}</span>
																		<span>{country.code}</span>
																		<span className="text-muted-foreground text-sm">{country.country}</span>
																	</span>
																	<Check
																		className={cn(
																			"ml-auto h-4 w-4",
																			formData.countryCode === country.code ? "opacity-100" : "opacity-0"
																		)}
																	/>
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<Input
											id="phoneNumber"
											type="tel"
											placeholder={t("hire.applicationForm.fields.phoneNumber.placeholder")}
											value={formData.phoneNumber}
											onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
											className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
											disabled={isSubmitting}
										/>
									</div>
								</div>

								{/* Company Size */}
								<div className="space-y-2">
									<label htmlFor="companySize" className="text-sm text-background/70">
										{t("hire.applicationForm.fields.companySize.label")} <span className="text-background/40">*</span>
									</label>
									<Select
										value={formData.companySize}
										onValueChange={(value) => setFormData({ ...formData, companySize: value })}
										disabled={isSubmitting}
									>
										<SelectTrigger className="w-full bg-background/5 border-background/10 text-background focus:border-background/30 h-11 [&>span]:text-background/70">
											<SelectValue placeholder={t("hire.applicationForm.fields.companySize.placeholder")} />
										</SelectTrigger>
										<SelectContent>
											{companySizeKeys.map((size) => (
												<SelectItem key={size} value={size}>
													{t(`hire.applicationForm.fields.companySize.options.${size}`)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* REMOVED: Project fields (projectType, rolesNeeded, budgetRange, projectDescription) */}
								{/* These are now collected via hiring requests after registration */}

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
												{t("hire.applicationForm.submit.sending")}
											</>
										) : (
											<>
												{t("hire.applicationForm.submit.button")}
												<ArrowIcon className="h-4 w-4" />
											</>
										)}
									</Button>
								</div>

								{/* Privacy note */}
								<p className="text-xs text-background/40 pt-2">{t("hire.applicationForm.privacyNote")}</p>
							</form>

							{/* Password Modal */}
							<Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
								<DialogContent className="sm:max-w-md">
									<DialogHeader>
										<DialogTitle>{t("hire.applicationForm.passwordModal.title")}</DialogTitle>
										<DialogDescription>{t("hire.applicationForm.passwordModal.description")}</DialogDescription>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="space-y-2">
											<label htmlFor="modal-password" className="text-sm font-medium">
												{t("hire.applicationForm.fields.password.label")}{" "}
												<span className="text-muted-foreground">*</span>
											</label>
											<Input
												id="modal-password"
												type="password"
												placeholder={t("hire.applicationForm.fields.password.placeholder")}
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												autoComplete="new-password"
												autoFocus
											/>
											<p className="text-xs text-muted-foreground">{t("hire.applicationForm.fields.password.hint")}</p>
										</div>

										<div className="space-y-2">
											<label htmlFor="modal-confirmPassword" className="text-sm font-medium">
												{t("hire.applicationForm.fields.confirmPassword.label")}{" "}
												<span className="text-muted-foreground">*</span>
											</label>
											<Input
												id="modal-confirmPassword"
												type="password"
												placeholder={t("hire.applicationForm.fields.confirmPassword.placeholder")}
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												autoComplete="new-password"
											/>
										</div>
									</div>
									<DialogFooter>
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowPasswordModal(false)}
											disabled={isSubmitting}
										>
											{t("common.cancel")}
										</Button>
										<Button type="button" onClick={handlePasswordSubmit} disabled={isSubmitting}>
											{isSubmitting ? (
												<>
													<Loader2 className="h-4 w-4 animate-spin mr-2" />
													{t("hire.applicationForm.submit.sending")}
												</>
											) : (
												t("hire.applicationForm.passwordModal.submit")
											)}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
