"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Menu, X } from "lucide-react";
import { CONFIG } from "@/lib/config";

export function Navigation() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id.toLowerCase().replace(/\s+/g, "-"));
		element?.scrollIntoView({ behavior: "smooth" });
		setMobileMenuOpen(false);
	};

	return (
		<motion.nav
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<a href="#" className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber to-amber-dark flex items-center justify-center glow-amber">
							<span className="text-white dark:text-background font-bold text-lg">ج</span>
						</div>
						<span className="text-xl font-semibold tracking-tight">Jeem</span>
					</a>

					{/* Desktop Nav Links */}
					<div className="hidden md:flex items-center gap-8">
						{CONFIG.nav.links.map((link) => (
							<button
								key={link}
								onClick={() => scrollToSection(link)}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								{link}
							</button>
						))}
					</div>

					{/* Desktop CTA and Theme Toggle */}
					<div className="hidden md:flex items-center gap-3">
						<ThemeToggle />
						<Button
							onClick={() => scrollToSection("apply")}
							className="bg-amber hover:bg-amber-dark text-white dark:text-background font-medium glow-amber"
						>
							{CONFIG.nav.cta}
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>

					{/* Mobile Menu Button and Theme Toggle */}
					<div className="flex items-center gap-2 md:hidden">
						<ThemeToggle />
						<button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2" aria-label="Toggle menu">
							{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="md:hidden py-4 border-t border-border"
					>
						<div className="flex flex-col gap-4">
							{CONFIG.nav.links.map((link) => (
								<button
									key={link}
									onClick={() => scrollToSection(link)}
									className="text-left text-muted-foreground hover:text-foreground transition-colors py-2"
								>
									{link}
								</button>
							))}
							<Button
								onClick={() => scrollToSection("apply")}
								className="bg-amber hover:bg-amber-dark text-white dark:text-background font-medium w-full"
							>
								{CONFIG.nav.cta}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</motion.div>
				)}
			</div>
		</motion.nav>
	);
}
