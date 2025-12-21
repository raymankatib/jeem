"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	// Prevent hydration mismatch
	React.useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	};

	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="h-9 w-9 rounded-lg border border-border bg-secondary/50 hover:bg-secondary"
				aria-label="Toggle theme"
			>
				<span className="h-4 w-4" />
			</Button>
		);
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="h-9 w-9 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-all duration-300"
			aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
		>
			{resolvedTheme === "dark" ? (
				<Sun className="h-4 w-4 text-amber transition-transform duration-300 hover:rotate-45" />
			) : (
				<Moon className="h-4 w-4 text-amber transition-transform duration-300 hover:-rotate-12" />
			)}
		</Button>
	);
}
