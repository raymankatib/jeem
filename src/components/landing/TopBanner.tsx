"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

export function TopBanner() {
	const { t, i18n } = useTranslation();
	const isRTL = i18n.language === "ar";
	const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

	return (
		<motion.div
			initial={{ y: -36, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			className="fixed top-0 inset-x-0 z-60 bg-foreground text-background"
		>
			<Link
				href="/hire"
				className="container-narrow flex items-center justify-center gap-2 py-2.5 text-xs font-medium hover:opacity-80 transition-opacity"
			>
				<Building2 className="h-3.5 w-3.5" />
				<span>{t("topBanner.forCompanies")}</span>
				<ArrowIcon className="h-3 w-3" />
			</Link>
		</motion.div>
	);
}
