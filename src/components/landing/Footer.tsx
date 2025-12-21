import { Mail } from "lucide-react";

export function Footer() {
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
							<span className="text-base font-medium">Jeem</span>
						</div>
						<span className="text-muted-foreground text-sm">Built for people who ship</span>
					</div>

					{/* Links */}
					<div className="flex items-center gap-6">
						<a
							href="mailto:hello@jeem.work"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2"
						>
							<Mail className="h-4 w-4" />
							hello@jeem.work
						</a>
						<a
							href="https://twitter.com/jeemwork"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
						>
							Twitter/X
						</a>
						<a
							href="https://linkedin.com/company/jeem"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
						>
							LinkedIn
						</a>
					</div>
				</div>

				{/* Copyright */}
				<div className="mt-8 pt-8 border-t border-border">
					<p className="text-sm text-muted-foreground text-center">
						© {new Date().getFullYear()} Jeem. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
