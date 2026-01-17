import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cairo, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { AuthProvider } from "@/components/auth-provider";
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

// const playfairDisplay = Playfair_Display({
// 	variable: "--font-serif",
// 	subsets: ["latin"],
// 	weight: ["400", "500", "600", "700"]
// });

export const metadata: Metadata = {
	metadataBase: new URL("https://jeem.now"),
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
		title: "Jeem — Join the Network for Builders",
		description:
			"Apply to join Jeem's premium talent network. Get matched with real work, quality teams, and growth opportunities.",
		type: "website",
		images: [
			{
				url: "/jeem-office.jpg",
				width: 729,
				height: 727,
				alt: "Jeem Office"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "Jeem — Join the Network for Builders Who Ship",
		description:
			"Apply to join Jeem's premium talent network. Get matched with real work, quality teams, and growth opportunities.",
		images: ["/jeem-office.jpg"]
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
						<AuthProvider>
							{children}
							<Toaster position="bottom-right" richColors />
						</AuthProvider>
					</ThemeProvider>
				</I18nProvider>
				<Analytics />
			</body>
		</html>
	);
}
