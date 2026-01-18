"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ArrowLeft, ArrowRight, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Navigation() {
	const { t, i18n } = useTranslation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const isRTL = i18n.language === "ar";
	const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

	// Check if user is logged in
	useEffect(() => {
		const supabase = createClient();

		const checkUser = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				setIsLoggedIn(true);
				setIsAdmin(user.user_metadata?.role === 'admin');
			}
		};

		checkUser();

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				setIsLoggedIn(true);
				setIsAdmin(session.user.user_metadata?.role === 'admin');
			} else {
				setIsLoggedIn(false);
				setIsAdmin(false);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	const navLinks = [
		{ key: "roles", id: "roles" },
		{ key: "howItWorks", id: "how-it-works" },
		{ key: "benefits", id: "benefits" },
		{ key: "faq", id: "faq" }
	];

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		element?.scrollIntoView({ behavior: "smooth" });
		setMobileMenuOpen(false);
	};

	return (
		<motion.nav
			initial={{ y: -10, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
			className="fixed top-0 left-0 right-0 z-50 w-full py-4 px-6 sm:px-8 lg:px-12 bg-background/80 backdrop-blur-md"
		>
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between">
					{/* Left - Logo + Email */}
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
							className="flex items-center gap-2 cursor-pointer"
						>
							<div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center p-1">
								<Image src="/white-logo.png" alt="Jeem Logo" width={24} height={24} className="dark:hidden" />
								<Image src="/black-logo.png" alt="Jeem Logo" width={24} height={24} className="hidden dark:block" />
							</div>
						</button>

					</div>

					{/* Center - Desktop Nav Links */}
					<div className="hidden lg:flex items-center gap-1">
						{navLinks.map((link, index) => (
							<>
								<button
									key={link.key}
									onClick={() => scrollToSection(link.id)}
									className="text-sm text-foreground hover:text-muted-foreground transition-colors duration-200 cursor-pointer font-medium px-3 py-2"
								>
									{t(`nav.links.${link.key}`)}
								</button>
								{index < navLinks.length - 1 && (
									<span className="text-muted-foreground/50">·</span>
								)}
							</>
						))}
					</div>

					{/* Right - Login + CTA */}
					<div className="hidden lg:flex items-center gap-3">
						<LanguageSwitcher />
						<ThemeToggle />
						{isLoggedIn ? (
							<Link href={isAdmin ? "/admin/dashboard" : "/dashboard"}>
								<Button
									variant="ghost"
									className="h-9 px-4 text-sm font-medium"
								>
									{t("dashboard.title")}
								</Button>
							</Link>
						) : (
							<Link href="/login">
								<span className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors cursor-pointer">
									{t("nav.login")}
								</span>
							</Link>
						)}
						{/* Pill CTA - outlined style like reference */}
						<Button
							onClick={() => scrollToSection("apply")}
							variant="outline"
							className="h-10 px-5 text-sm font-medium rounded-full border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-200"
						>
							{t("nav.cta")} — It&apos;s Free
						</Button>
					</div>

					{/* Mobile - Menu controls */}
					<div className="flex items-center gap-1 lg:hidden">
						<LanguageSwitcher />
						<ThemeToggle />
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="p-2 text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Toggle menu"
						>
							{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="lg:hidden py-4 mt-4 border-t border-border/30"
					>
						<div className="flex flex-col gap-1">
							{/* Mobile email */}
							<a
								href={`mailto:${t("common.email")}`}
								className="flex items-center text-sm text-muted-foreground hover:text-foreground py-3 px-1"
							>
								{t("common.email")}
							</a>
							
							<div className="h-px bg-border/30 my-2" />
							
							{navLinks.map((link) => (
								<button
									key={link.key}
									onClick={() => scrollToSection(link.id)}
									className="text-foreground hover:text-muted-foreground transition-colors py-3 px-1 text-start font-medium"
								>
									{t(`nav.links.${link.key}`)}
								</button>
							))}
							{isLoggedIn ? (
								<Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="w-full">
									<Button
										variant="ghost"
										className="w-full mt-2 justify-start font-medium"
									>
										{t("dashboard.title")}
									</Button>
								</Link>
							) : (
								<Link href="/login" className="w-full">
									<Button
										variant="ghost"
										className="w-full mt-2 justify-start font-medium"
									>
										{t("nav.login")}
									</Button>
								</Link>
							)}
							<Button
								onClick={() => scrollToSection("apply")}
								className="bg-foreground hover:bg-foreground/90 text-background font-medium w-full mt-2 gap-2 rounded-full"
							>
								{t("nav.cta")} — It&apos;s Free
								<ArrowIcon className="h-4 w-4" />
							</Button>
						</div>
					</motion.div>
				)}
			</div>
		</motion.nav>
	);
}
