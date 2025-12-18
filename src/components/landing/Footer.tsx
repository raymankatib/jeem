import { Mail } from "lucide-react";

export function Footer() {
	return (
		<footer className="py-12 border-t border-border bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					{/* Logo and tagline */}
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber to-amber-dark flex items-center justify-center">
								<span className="text-white dark:text-background font-bold text-lg">ج</span>
							</div>
							<span className="text-xl font-semibold">Jeem</span>
						</div>
						<span className="text-muted-foreground text-sm">Built for people who ship</span>
					</div>

					{/* Links */}
					<div className="flex items-center gap-6">
						<a
							href="mailto:hello@jeem.work"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
						>
							<Mail className="h-4 w-4" />
							hello@jeem.work
						</a>
						<a
							href="https://twitter.com/jeemwork"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Twitter/X
						</a>
						<a
							href="https://linkedin.com/company/jeem"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							LinkedIn
						</a>
					</div>
				</div>

				{/* Copyright */}
				<div className="mt-8 pt-8 border-t border-border text-center">
					<p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Jeem. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
