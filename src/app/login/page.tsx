"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowLeft, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";

export default function LoginPage() {
	const { t, i18n } = useTranslation();
	const router = useRouter();
	const isRTL = i18n.language === "ar";
	const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: ""
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Client-side validation
		if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			toast.error(t("auth.login.validation.emailInvalid"));
			return;
		}
		if (!formData.password || formData.password.length < 6) {
			toast.error(t("auth.login.validation.passwordTooShort"));
			return;
		}

		setIsLoading(true);

		try {
			const supabase = createClient();
			const { data, error } = await supabase.auth.signInWithPassword({
				email: formData.email,
				password: formData.password
			});

			if (error) {
				toast.error(error.message);
				return;
			}

			if (data.user) {
				toast.success(t("auth.login.success"));

				// Redirect based on user role
				const isAdmin = data.user.user_metadata?.role === 'admin';
				if (isAdmin) {
					router.push("/admin/dashboard");
				} else {
					router.push("/dashboard");
				}
				router.refresh();
			}
		} catch (error) {
			console.error("Login error:", error);
			toast.error(t("auth.login.errors.generic"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<AuthNav />
			<div className="min-h-screen flex items-center justify-center bg-white dark:bg-black pt-20 p-4 sm:p-6 lg:p-8">
				<div className="w-full max-w-md">
					{/* Login Card with hero-card styling */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
						className="hero-card p-8 sm:p-10"
					>
						{/* Header */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1, duration: 0.4 }}
							className="text-center mb-8"
						>
							<h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight mb-3">
								{t("auth.login.title")}
							</h1>
							<p className="text-muted-foreground">{t("auth.login.subtitle")}</p>
						</motion.div>

						{/* Divider */}
						<motion.div
							initial={{ opacity: 0, scaleX: 0 }}
							animate={{ opacity: 1, scaleX: 1 }}
							transition={{ delay: 0.2, duration: 0.4 }}
							className="w-full h-px bg-border mb-8 origin-center"
						/>

						{/* Form */}
						<motion.form
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3, duration: 0.4 }}
							onSubmit={handleSubmit}
							className="space-y-5"
						>
							<div className="space-y-2">
								<label htmlFor="email" className="text-sm font-medium text-foreground">
									{t("auth.login.fields.email.label")}
								</label>
								<div className="relative">
									<Mail className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="email"
										type="email"
										placeholder={t("auth.login.fields.email.placeholder")}
										value={formData.email}
										onChange={(e) => setFormData({ ...formData, email: e.target.value })}
										className="h-12 ps-11 bg-white dark:bg-black/50 border-border/50 rounded-xl focus:border-foreground transition-colors"
										disabled={isLoading}
										autoComplete="email"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium text-foreground">
									{t("auth.login.fields.password.label")}
								</label>
								<div className="relative">
									<Lock className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="password"
										type="password"
										placeholder={t("auth.login.fields.password.placeholder")}
										value={formData.password}
										onChange={(e) => setFormData({ ...formData, password: e.target.value })}
										className="h-12 ps-11 bg-white dark:bg-black/50 border-border/50 rounded-xl focus:border-foreground transition-colors"
										disabled={isLoading}
										autoComplete="current-password"
									/>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full bg-foreground hover:bg-foreground/90 text-background font-medium h-12 text-base rounded-full transition-all duration-200 gap-2 shadow-soft mt-2"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										{t("auth.login.submit.loading")}
									</>
								) : (
									<>
										{t("auth.login.submit.button")}
										<ArrowIcon className="h-4 w-4" />
									</>
								)}
							</Button>
						</motion.form>

						{/* Footer links */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5, duration: 0.4 }}
							className="mt-8 text-center text-sm text-muted-foreground"
						>
							<p className="mb-3">{t("auth.login.noAccount")}</p>
							<div className="flex gap-3 justify-center">
								<Link
									href="/#apply"
									className="text-foreground hover:text-accent-orange font-medium transition-colors"
								>
									{t("auth.login.applyForTalent")}
								</Link>
								<span className="text-border">|</span>
								<Link
									href="/hire#apply"
									className="text-foreground hover:text-accent-orange font-medium transition-colors"
								>
									{t("auth.login.applyForCompany")}
								</Link>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</>
	);
}
