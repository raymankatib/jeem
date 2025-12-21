"use client";

import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";

export function Footer() {
	const { t } = useTranslation();

	return (
		<footer className="py-12 border-t border-border bg-background">
			<div className="container-narrow">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					{/* Logo and tagline */}
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2.5">
							<div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
								<span className="text-background font-semibold text-sm">ج</span>
							</div>
							<span className="text-base font-medium">{t("common.jeem")}</span>
						</div>
						<span className="text-muted-foreground text-sm">{t("footer.tagline")}</span>
					</div>

					{/* Links */}
					<div className="flex items-center gap-6">
						<a
							href={`mailto:${t("common.email")}`}
							className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2"
						>
							<Mail className="h-4 w-4" />
							{t("common.email")}
						</a>
						<a
							href="https://twitter.com/jeemwork"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
						>
							{t("footer.links.twitterX")}
						</a>
						<a
							href="https://linkedin.com/company/jeem"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
						>
							{t("footer.links.linkedin")}
						</a>
					</div>
				</div>

				{/* Copyright */}
				<div className="mt-8 pt-8 border-t border-border">
					<p className="text-sm text-muted-foreground text-center">
						{t("footer.copyright", { year: new Date().getFullYear() })}
					</p>
				</div>
			</div>
		</footer>
	);
}
