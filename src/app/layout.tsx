import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cairo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import "./globals.css";

const inter = Inter({
	variable: "--font-sans",
	subsets: ["latin"]
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"]
});

const cairoArabic = Cairo({
	variable: "--font-arabic",
	subsets: ["arabic", "latin"],
	weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
	title: "Jeem — Join the Network for Builders Who Ship",
	description:
		"Apply to join Jeem's premium talent network. Get matched with real work, quality teams, and growth opportunities. Remote-friendly, paid in USD.",
	keywords: [
		"remote work",
		"talent network",
		"freelance",
		"software development",
		"design",
		"marketing",
		"vibe coding",
		"AI video",
		"lead generation"
	],
	openGraph: {
		title: "Jeem — Join the Network for Builders Who Ship",
		description:
			"Apply to join Jeem's premium talent network. Get matched with real work, quality teams, and growth opportunities.",
		type: "website"
	}
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} ${jetbrainsMono.variable} ${cairoArabic.variable} antialiased`}>
				<I18nProvider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						{children}
						<Toaster position="bottom-right" richColors />
					</ThemeProvider>
				</I18nProvider>
			</body>
		</html>
	);
}
