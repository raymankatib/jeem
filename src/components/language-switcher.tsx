"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const languages = [
	{ code: "en", label: "EN", name: "English" },
	{ code: "ar", label: "ع", name: "العربية" }
];

export function LanguageSwitcher() {
	const { i18n } = useTranslation();

	const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];
	const nextLang = languages.find((l) => l.code !== i18n.language) || languages[1];

	const toggleLanguage = () => {
		i18n.changeLanguage(nextLang.code);
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleLanguage}
			className="h-9 w-9 text-muted-foreground hover:text-foreground"
			title={`Switch to ${nextLang.name}`}
		>
			<span className="text-sm font-medium">{currentLang.label}</span>
			<span className="sr-only">Switch to {nextLang.name}</span>
		</Button>
	);
}

