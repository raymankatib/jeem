"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Code2, TrendingUp, Target, Palette, Briefcase, LucideIcon, Users } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface TalentCategory {
	id: string;
	icon: LucideIcon;
	translationKey: string;
}

const categories: TalentCategory[] = [
	{ id: "engineering", icon: Code2, translationKey: "engineering" },
	{ id: "growth", icon: TrendingUp, translationKey: "growth" },
	{ id: "revenue", icon: Target, translationKey: "revenue" },
	{ id: "creative", icon: Palette, translationKey: "creative" },
	{ id: "operations", icon: Briefcase, translationKey: "operations" }
];

const roleKeys: Record<string, string[]> = {
	engineering: ["vibeCodingEngineer", "softwareDeveloper", "contentCreatorEngineer"],
	growth: ["marketer", "seoAeoSpecialist", "socialMediaManager"],
	revenue: ["leadGenerator", "salesPipelinesBuilder", "leadQualifier"],
	creative: ["designer", "aiVideoCreator"],
	operations: ["virtualAssistant"]
};

export function TalentPoolSection() {
	const { t } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [activeCategory, setActiveCategory] = useState("engineering");

	const activeRoles = roleKeys[activeCategory] || [];

	return (
		<section id="talent-pool" className="py-32 relative bg-noise" ref={ref}>
			<div className="container-narrow">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="max-w-2xl mb-16">
						<p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
							{t("hire.talentPool.sectionLabel")}
						</p>
						<h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">{t("hire.talentPool.title")}</h2>
						<p className="text-muted-foreground text-lg leading-relaxed">{t("hire.talentPool.description")}</p>
					</motion.div>

					{/* Category Pills */}
					<motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-12">
						{categories.map((category) => {
							const Icon = category.icon;
							return (
								<button
									key={category.id}
									onClick={() => setActiveCategory(category.id)}
									className={`
									flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
									${
										activeCategory === category.id
											? "bg-foreground text-background"
											: "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
									}
								`}
								>
									<Icon className="h-4 w-4" />
									{t(`hire.talentPool.categories.${category.translationKey}.label`)}
								</button>
							);
						})}
					</motion.div>
				</motion.div>

				{/* Talent Cards Grid */}
				<AnimatePresence mode="wait">
					<motion.div
						key={activeCategory}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
						className="grid grid-cols-12 gap-4"
					>
						{activeRoles.map((roleKey, idx) => {
							const isLarge = idx === 0;
							const basePath = `hire.talentPool.categories.${activeCategory}.roles.${roleKey}`;
							const skills = t(`${basePath}.skills`, { returnObjects: true }) as string[];
							const availability = t(`${basePath}.availability`, { returnObjects: true }) as string[];

							return (
								<motion.div
									key={roleKey}
									initial={{ opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
									className={`
										${isLarge ? "col-span-12 lg:col-span-6" : "col-span-12 md:col-span-6 lg:col-span-6"}
									`}
								>
									<div
										className={`
										h-full bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-soft 
										hover:border-foreground/10 transition-colors duration-200 group
									`}
									>
										{/* Role Header */}
										<div className="flex items-start justify-between mb-5">
											<div>
												<h3 className="text-lg font-semibold mb-1 group-hover:text-foreground transition-colors">
													{t(`${basePath}.title`)}
												</h3>
												<p className="text-sm text-muted-foreground">{t(`${basePath}.description`)}</p>
											</div>
											<div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-full">
												<Users className="h-3 w-3" />
												{t(`${basePath}.count`)}
											</div>
										</div>

										{/* Skills */}
										<div className="mb-5">
											<div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
												{t("hire.talentPool.skills")}
											</div>
											<div className="flex flex-wrap gap-1.5">
												{Array.isArray(skills) &&
													skills.map((skill) => (
														<Badge
															key={skill}
															variant="secondary"
															className="bg-secondary/80 border-0 text-muted-foreground font-normal text-xs px-2 py-0.5"
														>
															{skill}
														</Badge>
													))}
											</div>
										</div>

										{/* Availability */}
										<div className="pt-5 border-t border-border">
											<div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
												{t("hire.talentPool.availability")}
											</div>
											<div className="flex flex-wrap gap-2">
												{Array.isArray(availability) &&
													availability.map((item) => (
														<span key={item} className="text-sm text-foreground/80">
															{item}
														</span>
													))}
											</div>
										</div>
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				</AnimatePresence>
			</div>
		</section>
	);
}

