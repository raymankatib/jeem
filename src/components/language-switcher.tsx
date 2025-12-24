"use client";

import { useTranslation } from "react-i18next";

const languages = [
	{ code: "en", label: "English", name: "English" },
	{ code: "ar", label: "عربي", name: "العربية" }
];

export function LanguageSwitcher() {
	const { i18n } = useTranslation();

	const nextLang = languages.find((l) => l.code !== i18n.language) || languages[1];

	const toggleLanguage = () => {
		i18n.changeLanguage(nextLang.code);
	};

	return (
		<button
			onClick={toggleLanguage}
			className="h-8 px-3 rounded-full border border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors duration-200 flex items-center justify-center"
			title={`Switch to ${nextLang.name}`}
		>
			{nextLang.code === "ar" ? (
				<span className="font-(family-name:--font-arabic) text-sm font-medium">{nextLang.label}</span>
			) : (
				<span className="text-sm font-medium">{nextLang.label}</span>
			)}
			<span className="sr-only">Switch to {nextLang.name}</span>
		</button>
	);
}
