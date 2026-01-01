"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Briefcase, ChevronDown, ChevronUp, Rocket } from "lucide-react";
import Link from "next/link";

export function HireTopBanner() {
	const { t, i18n } = useTranslation();
	const [isExpanded, setIsExpanded] = useState(true);
	const isRTL = i18n.language === "ar";
	const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

	return (
		<div className="fixed bottom-6 start-6 z-60">
			<AnimatePresence mode="wait">
				{isExpanded ? (
					<motion.div
						key="expanded"
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{
							duration: 0.3,
							ease: [0.25, 0.46, 0.45, 0.94]
						}}
						className="max-w-xs"
					>
						{/* Glow effect behind the card */}
						<div className="absolute -inset-1 bg-linear-to-r from-teal-500/20 via-cyan-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-70" />

						{/* Main card */}
						<div className="relative overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-2xl">
							{/* Animated gradient border */}
							<div className="absolute inset-0 bg-linear-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 opacity-50" />

							{/* Shimmer effect */}
							<motion.div
								className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -skew-x-12"
								animate={{ x: ["-100%", "200%"] }}
								transition={{
									duration: 3,
									repeat: Infinity,
									repeatDelay: 4,
									ease: "easeInOut"
								}}
							/>

							{/* Minimize button */}
							<button
								onClick={(e) => {
									e.preventDefault();
									setIsExpanded(false);
								}}
								className="absolute top-2 end-2 p-1 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/10 transition-colors z-10"
								aria-label="Minimize"
							>
								<ChevronDown className="h-3.5 w-3.5" />
							</button>

							<Link href="/" className="relative block p-4 pe-8 group">
								{/* Badge */}
								<div className="flex items-center gap-1.5 mb-2">
									<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-linear-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
										<Rocket className="h-3 w-3 text-teal-400" />
										<span className="text-[10px] font-semibold uppercase tracking-wider text-teal-300">
											{t("hire.topBanner.badge", "For Talent")}
										</span>
									</span>
								</div>

								{/* Content */}
								<div className="flex items-center gap-3">
									<div className="shrink-0 p-2 rounded-lg bg-linear-to-br from-teal-500/20 to-cyan-600/20 border border-teal-500/20">
										<Briefcase className="h-5 w-5 text-teal-400" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-white leading-tight">
											{t("hire.topBanner.title", "Looking for work?")}
										</p>
										<p className="text-xs text-zinc-400 mt-0.5">
											{t("hire.topBanner.subtitle", "Join our talent network →")}
										</p>
									</div>
									<motion.div
										className="shrink-0 p-1.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors"
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
									>
										<ArrowIcon className="h-4 w-4 text-white" />
									</motion.div>
								</div>
							</Link>
						</div>
					</motion.div>
				) : (
					<motion.div
						key="minimized"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						transition={{ duration: 0.2 }}
					>
						{/* Minimized floating button */}
						<div className="relative group">
							{/* Glow effect */}
							<div className="absolute -inset-1 bg-linear-to-r from-teal-500/30 via-cyan-500/30 to-emerald-500/30 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
							
							<button
								onClick={() => setIsExpanded(true)}
								className="relative flex items-center gap-2 px-3 py-2.5 rounded-full bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-white/10 shadow-xl hover:border-teal-500/30 transition-colors"
								aria-label="Expand banner"
							>
								<div className="p-1.5 rounded-full bg-linear-to-br from-teal-500/20 to-cyan-600/20 border border-teal-500/20">
									<Briefcase className="h-4 w-4 text-teal-400" />
								</div>
								<span className="text-xs font-medium text-zinc-300 hidden sm:inline">
									{t("hire.topBanner.badge", "For Talent")}
								</span>
								<ChevronUp className="h-3.5 w-3.5 text-zinc-500 group-hover:text-teal-400 transition-colors" />
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

