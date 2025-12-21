import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	i18n: {
		locales: ["en", "cs"],
		defaultLocale: "en"
	}
};

export default nextConfig;
