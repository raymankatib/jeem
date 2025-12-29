"use client";

import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Home } from "lucide-react";

export function AuthNav() {
	const { t } = useTranslation();

	return (
		<nav className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
			<div className="container max-w-7xl mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
						<div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center p-1.5">
							<Image src="/white-logo.png" alt="Jeem Logo" width={28} height={28} className="dark:hidden" />
							<Image src="/black-logo.png" alt="Jeem Logo" width={28} height={28} className="hidden dark:block" />
						</div>
						<span className="text-lg font-medium tracking-tight">{t("common.jeem")}</span>
					</Link>

					{/* Right Side Actions */}
					<div className="flex items-center gap-2">
						<Link
							href="/"
							className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
						>
							<Home className="h-4 w-4" />
							<span>{t("nav.home")}</span>
						</Link>
						<LanguageSwitcher />
						<ThemeToggle />
					</div>
				</div>
			</div>
		</nav>
	);
}
