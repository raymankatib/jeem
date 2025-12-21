"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ArrowLeft, ArrowRight, Menu, X } from "lucide-react";

export function Navigation() {
	const { t, i18n } = useTranslation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const isRTL = i18n.language === "ar";
	const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

	const navLinks = [
		{ key: "roles", id: "roles" },
		{ key: "howItWorks", id: "how-it-works" },
		{ key: "benefits", id: "benefits" },
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
					<a href="#" className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
							<span className="text-background font-semibold text-base">ج</span>
						</div>
						<span className="text-lg font-medium tracking-tight">{t("common.jeem")}</span>
					</a>

					{/* Desktop Nav Links */}
					<div className="hidden md:flex items-center gap-8">
						{navLinks.map((link) => (
							<button
								key={link.key}
								onClick={() => scrollToSection(link.id)}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
							>
								{t(`nav.links.${link.key}`)}
							</button>
						))}
					</div>

					{/* Desktop CTA, Language Switcher and Theme Toggle */}
					<div className="hidden md:flex items-center gap-2">
						<LanguageSwitcher />
						<ThemeToggle />
						<Button
							onClick={() => scrollToSection("apply")}
							className="bg-foreground hover:bg-foreground/90 text-background font-medium h-9 px-4 text-sm transition-opacity duration-200 gap-2"
						>
							{t("nav.cta")}
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
									{t(`nav.links.${link.key}`)}
								</button>
							))}
							<Button
								onClick={() => scrollToSection("apply")}
								className="bg-foreground hover:bg-foreground/90 text-background font-medium w-full mt-4 gap-2"
							>
								{t("nav.cta")}
								<ArrowIcon className="h-4 w-4" />
							</Button>
						</div>
					</motion.div>
				)}
			</div>
		</motion.nav>
	);
}
