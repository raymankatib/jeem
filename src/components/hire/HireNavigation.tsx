"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ArrowLeft, ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export function HireNavigation() {
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
		{ key: "whyJeem", id: "why-jeem" },
		{ key: "talentPool", id: "talent-pool" },
		{ key: "howItWorks", id: "how-it-works" },
		{ key: "proof", id: "proof" },
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
			className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border"
		>
			<div className="container-narrow">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<button
						type="button"
						onClick={() => {
							window.scrollTo({ top: 0, behavior: "smooth" });
						}}
						className="flex items-center gap-2.5 cursor-pointer"
					>
						<div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center p-1.5">
							<Image src="/white-logo.png" alt="Jeem Logo" width={28} height={28} className="dark:hidden" />
							<Image src="/black-logo.png" alt="Jeem Logo" width={28} height={28} className="hidden dark:block" />
						</div>
						<span className="text-lg font-medium tracking-tight">{t("common.jeem")}</span>
						<span className="text-xs text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full">
							{t("hire.nav.badge")}
						</span>
					</button>

					{/* Desktop Nav Links */}
					<div className="hidden md:flex items-center gap-8">
						{navLinks.map((link) => (
							<button
								key={link.key}
								onClick={() => scrollToSection(link.id)}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
							>
								{t(`hire.nav.links.${link.key}`)}
							</button>
						))}
					</div>

					{/* Desktop CTA, Language Switcher and Theme Toggle */}
					<div className="hidden md:flex items-center gap-2">
						<LanguageSwitcher />
						<ThemeToggle />
						{isLoggedIn ? (
							<Link href={isAdmin ? "/admin/dashboard" : "/dashboard"}>
								<Button
									variant="ghost"
									className="h-9 px-3 text-sm"
								>
									{t("dashboard.title")}
								</Button>
							</Link>
						) : (
							<Link href="/login">
								<Button
									variant="ghost"
									className="h-9 px-3 text-sm"
								>
									{t("nav.login")}
								</Button>
							</Link>
						)}
						<Button
							onClick={() => scrollToSection("apply")}
							className="bg-foreground hover:bg-foreground/90 text-background font-medium h-9 px-4 text-sm transition-opacity duration-200 gap-2"
						>
							{t("hire.nav.cta")}
							<ArrowIcon className="h-3.5 w-3.5" />
						</Button>
					</div>

					{/* Mobile Menu Button, Language Switcher and Theme Toggle */}
					<div className="flex items-center gap-1 md:hidden">
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
						className="md:hidden py-4 border-t border-border"
					>
						<div className="flex flex-col gap-1">
							{navLinks.map((link) => (
								<button
									key={link.key}
									onClick={() => scrollToSection(link.id)}
									className="text-muted-foreground hover:text-foreground transition-colors py-3 px-1 text-start"
								>
									{t(`hire.nav.links.${link.key}`)}
								</button>
							))}
							{isLoggedIn ? (
								<Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="w-full">
									<Button
										variant="ghost"
										className="w-full mt-2 justify-start"
									>
										{t("dashboard.title")}
									</Button>
								</Link>
							) : (
								<Link href="/login" className="w-full">
									<Button
										variant="ghost"
										className="w-full mt-2 justify-start"
									>
										{t("nav.login")}
									</Button>
								</Link>
							)}
							<Button
								onClick={() => scrollToSection("apply")}
								className="bg-foreground hover:bg-foreground/90 text-background font-medium w-full mt-2 gap-2"
							>
								{t("hire.nav.cta")}
								<ArrowIcon className="h-4 w-4" />
							</Button>
						</div>
					</motion.div>
				)}
			</div>
		</motion.nav>
	);
}
