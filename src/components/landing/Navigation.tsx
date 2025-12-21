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
			initial={{ y: -10, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
			className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border"
		>
			<div className="container-narrow">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<a href="#" className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
							<span className="text-background font-semibold text-base">ج</span>
						</div>
						<span className="text-lg font-medium tracking-tight">Jeem</span>
					</a>

					{/* Desktop Nav Links */}
					<div className="hidden md:flex items-center gap-8">
						{CONFIG.nav.links.map((link) => (
							<button
								key={link}
								onClick={() => scrollToSection(link)}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
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
							className="bg-foreground hover:bg-foreground/90 text-background font-medium h-9 px-4 text-sm transition-opacity duration-200"
						>
							{CONFIG.nav.cta}
							<ArrowRight className="ml-2 h-3.5 w-3.5" />
						</Button>
					</div>

					{/* Mobile Menu Button and Theme Toggle */}
					<div className="flex items-center gap-2 md:hidden">
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
							{CONFIG.nav.links.map((link) => (
								<button
									key={link}
									onClick={() => scrollToSection(link)}
									className="text-left text-muted-foreground hover:text-foreground transition-colors py-3 px-1"
								>
									{link}
								</button>
							))}
							<Button
								onClick={() => scrollToSection("apply")}
								className="bg-foreground hover:bg-foreground/90 text-background font-medium w-full mt-4"
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
