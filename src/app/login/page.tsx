"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";

export default function LoginPage() {
	const { t } = useTranslation();
	const router = useRouter();
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
			<div className="min-h-screen flex items-center justify-center bg-background text-foreground pt-20 p-4">
				<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-semibold tracking-tight mb-2">{t("auth.login.title")}</h1>
					<p className="text-muted-foreground">{t("auth.login.subtitle")}</p>
				</div>

				<Card className="bg-card border-border">
					<CardContent className="pt-6">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="email" className="text-sm text-muted-foreground">
									{t("auth.login.fields.email.label")}
								</label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="email"
										type="email"
										placeholder={t("auth.login.fields.email.placeholder")}
										value={formData.email}
										onChange={(e) => setFormData({ ...formData, email: e.target.value })}
										className="h-11 pl-10"
										disabled={isLoading}
										autoComplete="email"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label htmlFor="password" className="text-sm text-muted-foreground">
									{t("auth.login.fields.password.label")}
								</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="password"
										type="password"
										placeholder={t("auth.login.fields.password.placeholder")}
										value={formData.password}
										onChange={(e) => setFormData({ ...formData, password: e.target.value })}
										className="h-11 pl-10"
										disabled={isLoading}
										autoComplete="current-password"
									/>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full font-medium h-11"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin me-2" />
										{t("auth.login.submit.loading")}
									</>
								) : (
									t("auth.login.submit.button")
								)}
							</Button>
						</form>

						<div className="mt-6 text-center text-sm text-muted-foreground">
							<p className="mb-2">{t("auth.login.noAccount")}</p>
							<div className="flex gap-2 justify-center">
								<Link href="/#apply" className="text-foreground hover:underline font-medium">
									{t("auth.login.applyForTalent")}
								</Link>
								<span className="text-muted-foreground">•</span>
								<Link href="/hire#apply" className="text-foreground hover:underline font-medium">
									{t("auth.login.applyForCompany")}
								</Link>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
		</>
	);
}
