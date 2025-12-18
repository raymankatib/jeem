import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"]
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"]
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
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
					{children}
					<Toaster position="bottom-right" richColors />
				</ThemeProvider>
			</body>
		</html>
	);
}
