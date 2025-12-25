"use client";

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { Shield, Clock, Users, Sparkles, HeartHandshake, Repeat, LucideIcon } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface ReasonItem {
	key: string;
	icon: LucideIcon;
}

const reasons: ReasonItem[] = [
	{ key: "preVetted", icon: Shield },
	{ key: "fastTurnaround", icon: Clock },
	{ key: "diversePool", icon: Users },
	{ key: "modernSkills", icon: Sparkles },
	{ key: "handHeld", icon: HeartHandshake },
	{ key: "longTerm", icon: Repeat }
];

export function WhyJeemSection() {
	const { t } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	// Define bento grid patterns for visual hierarchy
	const gridPatterns = [
		"col-span-12 md:col-span-6 lg:col-span-4",
		"col-span-12 md:col-span-6 lg:col-span-4",
		"col-span-12 md:col-span-6 lg:col-span-4",
		"col-span-12 md:col-span-6 lg:col-span-6",
		"col-span-12 md:col-span-6 lg:col-span-6",
		"col-span-12"
	];

	return (
		<section id="why-jeem" className="py-32 bg-surface relative bg-noise" ref={ref}>
			<div className="container-narrow">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="max-w-2xl mb-16">
						<p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
							{t("hire.whyJeem.sectionLabel")}
						</p>
						<h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">{t("hire.whyJeem.title")}</h2>
						<p className="text-muted-foreground text-lg leading-relaxed">{t("hire.whyJeem.description")}</p>
					</motion.div>

					{/* Bento Grid */}
					<motion.div variants={fadeInUp} className="grid grid-cols-12 gap-4">
						{reasons.map((reason, idx) => {
							const isFullWidth = idx === 5;
							const Icon = reason.icon;

							return (
								<motion.div
									key={reason.key}
									variants={fadeInUp}
									transition={{ delay: idx * 0.06 }}
									className={gridPatterns[idx] || gridPatterns[0]}
								>
									<div
										className={`
										h-full bg-card border border-border rounded-2xl shadow-soft
										hover:border-foreground/10 transition-colors duration-200
										${isFullWidth ? "p-8 lg:p-10" : "p-6 lg:p-8"}
									`}
									>
										{isFullWidth ? (
											// Full width layout - horizontal
											<div className="flex flex-col lg:flex-row lg:items-center gap-6">
												<div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center shrink-0">
													<Icon className="h-5 w-5 text-muted-foreground" />
												</div>
												<div className="flex-1">
													<h3 className="text-lg font-medium mb-2">
														{t(`hire.whyJeem.reasons.${reason.key}.title`)}
													</h3>
													<p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
														{t(`hire.whyJeem.reasons.${reason.key}.description`)}
													</p>
												</div>
											</div>
										) : (
											// Standard card layout - vertical
											<>
												<div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center mb-5">
													<Icon className="h-5 w-5 text-muted-foreground" />
												</div>
												<h3 className="text-base font-medium mb-2">
													{t(`hire.whyJeem.reasons.${reason.key}.title`)}
												</h3>
												<p className="text-muted-foreground text-sm leading-relaxed">
													{t(`hire.whyJeem.reasons.${reason.key}.description`)}
												</p>
											</>
										)}
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}


