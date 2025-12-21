"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const handleInit = () => {
			// Set initial direction and lang based on current language
			const isRTL = i18n.language === "ar";
			document.documentElement.dir = isRTL ? "rtl" : "ltr";
			document.documentElement.lang = i18n.language;
			setIsReady(true);
		};

		// Wait for i18n to be initialized
		if (i18n.isInitialized) {
			handleInit();
		} else {
			i18n.on("initialized", handleInit);
		}

		// Listen for language changes
		const handleLanguageChange = (lng: string) => {
			const isRTL = lng === "ar";
			document.documentElement.dir = isRTL ? "rtl" : "ltr";
			document.documentElement.lang = lng;
		};

		i18n.on("languageChanged", handleLanguageChange);

		return () => {
			i18n.off("languageChanged", handleLanguageChange);
		};
	}, []);

	if (!isReady) {
		return null;
	}

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

