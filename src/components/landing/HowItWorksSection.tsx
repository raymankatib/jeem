"use client";

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const stepKeys = ["apply", "getScreened", "getTrained", "matchToWork", "deliverAndGrow"];

export function HowItWorksSection() {
	const { t } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section id="how-it-works" className="py-32 relative bg-white dark:bg-black" ref={ref}>
			<div className="container-narrow">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="max-w-2xl mb-20">
						<p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
							{t("howItWorks.sectionLabel")}
						</p>
						<h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">{t("howItWorks.title")}</h2>
						<p className="text-muted-foreground text-lg leading-relaxed">{t("howItWorks.description")}</p>
					</motion.div>

					{/* Steps - Horizontal timeline on desktop, vertical on mobile */}
					<motion.div variants={fadeInUp} className="relative">
						{/* Desktop: Horizontal Layout */}
						<div className="hidden lg:grid lg:grid-cols-5 gap-0">
							{stepKeys.map((stepKey, idx) => (
								<motion.div key={stepKey} variants={fadeInUp} transition={{ delay: idx * 0.08 }} className="relative">
									{/* Connector line with gradient fade */}
									{idx < stepKeys.length - 1 && (
										<div className="absolute top-6 ltr:left-[calc(50%+26px)] ltr:right-[-8px] rtl:right-[calc(50%+26px)] rtl:left-[-8px] h-[2px] rounded-full bg-linear-to-r ltr:from-border ltr:via-muted-foreground/20 ltr:to-border rtl:from-border rtl:via-muted-foreground/20 rtl:to-border" />
									)}

									<div className="flex flex-col items-center text-center px-4">
										{/* Step number */}
										<div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mb-6 relative z-10 shadow-soft">
											<span className="text-sm font-medium text-muted-foreground">
												{t(`howItWorks.steps.${stepKey}.number`)}
											</span>
										</div>

										{/* Content */}
										<h3 className="text-base font-medium mb-2">{t(`howItWorks.steps.${stepKey}.title`)}</h3>
										<p className="text-sm text-muted-foreground leading-relaxed">
											{t(`howItWorks.steps.${stepKey}.description`)}
										</p>
									</div>
								</motion.div>
							))}
						</div>

						{/* Mobile: Vertical Layout */}
						<div className="lg:hidden space-y-0">
							{stepKeys.map((stepKey, idx) => (
								<motion.div
									key={stepKey}
									variants={fadeInUp}
									transition={{ delay: idx * 0.08 }}
									className="relative flex gap-6 rtl:flex-row-reverse"
								>
									{/* Left side: Number and connector */}
									<div className="flex flex-col items-center">
										<div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft relative z-10">
											<span className="text-sm font-medium text-muted-foreground">
												{t(`howItWorks.steps.${stepKey}.number`)}
											</span>
										</div>
										{idx < stepKeys.length - 1 && (
											<div className="w-[2px] h-full flex-1 my-2 rounded-full bg-linear-to-b from-border via-muted-foreground/20 to-border" />
										)}
									</div>

									{/* Right side: Content */}
									<div className="pb-12 flex-1">
										<h3 className="text-base font-medium mb-2">{t(`howItWorks.steps.${stepKey}.title`)}</h3>
										<p className="text-sm text-muted-foreground leading-relaxed">
											{t(`howItWorks.steps.${stepKey}.description`)}
										</p>
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
