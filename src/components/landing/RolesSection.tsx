"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Check, Code2, TrendingUp, Target, Palette, Briefcase, LucideIcon } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface RoleCategory {
	id: string;
	icon: LucideIcon;
	translationKey: string;
}

const categories: RoleCategory[] = [
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

export function RolesSection() {
	const { t } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [activeCategory, setActiveCategory] = useState("engineering");

	const activeRoles = roleKeys[activeCategory] || [];

	return (
		<section id="roles" className="py-32 bg-surface relative bg-noise" ref={ref}>
			<div className="container-narrow">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="max-w-2xl mb-16">
						<p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">{t("roles.sectionLabel")}</p>
						<h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">{t("roles.title")}</h2>
						<p className="text-muted-foreground text-lg leading-relaxed">{t("roles.description")}</p>
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
									flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
									${
										activeCategory === category.id
											? "bg-foreground text-background"
											: "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
									}
								`}
								>
									<Icon className="h-4 w-4" />
									{t(`roles.categories.${category.translationKey}.label`)}
								</button>
							);
						})}
					</motion.div>
				</motion.div>

				{/* Bento Grid of Roles - Outside the stagger container for independent animation */}
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
							// Create visual hierarchy through size variation
							const isLarge = idx === 0;
							const isMedium = idx === 1;
							const basePath = `roles.categories.${activeCategory}.roles.${roleKey}`;
							const whatYouDo = t(`${basePath}.whatYouDo`, { returnObjects: true }) as string[];
							const whatGoodLooksLike = t(`${basePath}.whatGoodLooksLike`, { returnObjects: true }) as string[];
							const tools = t(`${basePath}.tools`, { returnObjects: true }) as string[];

							return (
								<motion.div
									key={roleKey}
									initial={{ opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
									className={`
										${isLarge ? "col-span-12 lg:col-span-7" : ""}
										${isMedium ? "col-span-12 lg:col-span-5" : ""}
										${!isLarge && !isMedium ? "col-span-12 md:col-span-6 lg:col-span-4" : ""}
									`}
								>
									<div
										className={`
										h-full bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-soft 
										hover:border-foreground/10 transition-colors duration-200 group
									`}
									>
										{/* Role Title */}
										<h3
											className={`
											font-semibold mb-6 group-hover:text-foreground transition-colors
											${isLarge ? "text-xl lg:text-2xl" : "text-lg"}
										`}
										>
											{t(`${basePath}.title`)}
										</h3>

										<div className={`grid gap-6 ${isLarge ? "lg:grid-cols-2" : ""}`}>
											{/* What you'll do */}
											<div>
												<h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
													{t("roles.whatYouDo")}
												</h4>
												<ul className="space-y-2">
													{Array.isArray(whatYouDo) &&
														whatYouDo.map((item, i) => (
															<li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
																<Check className="h-4 w-4 text-foreground/40 shrink-0 mt-0.5" />
																<span>{item}</span>
															</li>
														))}
												</ul>
											</div>

											{/* What good looks like */}
											<div>
												<h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
													{t("roles.whatGoodLooksLike")}
												</h4>
												<ul className="space-y-2">
													{Array.isArray(whatGoodLooksLike) &&
														whatGoodLooksLike.map((item, i) => (
															<li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
																<Check className="h-4 w-4 text-foreground/40 shrink-0 mt-0.5" />
																<span>{item}</span>
															</li>
														))}
												</ul>
											</div>
										</div>

										{/* Tools */}
										<div className="mt-6 pt-6 border-t border-border">
											<div className="flex flex-wrap gap-2">
												{Array.isArray(tools) &&
													tools.map((tool) => (
														<Badge
															key={tool}
															variant="secondary"
															className="bg-secondary/80 border-0 text-muted-foreground font-normal text-xs px-2.5 py-1"
														>
															{tool}
														</Badge>
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
