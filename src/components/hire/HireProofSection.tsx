"use client";

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const metricKeys = ["avgHireTime", "retentionRate", "clientSatisfaction", "projectSuccess"];

export function HireProofSection() {
	const { t } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	const testimonials = t("hire.proof.testimonials", { returnObjects: true }) as Array<{
		quote: string;
		author: string;
		company: string;
	}>;
	const guarantees = t("hire.proof.guarantees.items", { returnObjects: true }) as string[];

	return (
		<section id="proof" className="py-32 relative bg-noise" ref={ref}>
			<div className="container-narrow">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="max-w-2xl mb-20">
						<p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
							{t("hire.proof.sectionLabel")}
						</p>
						<h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">{t("hire.proof.title")}</h2>
						<p className="text-muted-foreground text-lg leading-relaxed">{t("hire.proof.description")}</p>
					</motion.div>

					{/* Metrics - 4 column grid */}
					<motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
						{metricKeys.map((metricKey, idx) => (
							<motion.div key={metricKey} variants={fadeInUp} transition={{ delay: idx * 0.06 }}>
								<div className="h-full bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-soft text-center">
									<div className="text-3xl lg:text-4xl font-semibold mb-2">
										{t(`hire.proof.metrics.${metricKey}.value`)}
									</div>
									<p className="text-sm text-muted-foreground">{t(`hire.proof.metrics.${metricKey}.label`)}</p>
								</div>
							</motion.div>
						))}
					</motion.div>

					{/* Testimonials - Mixed card sizes */}
					<motion.div variants={fadeInUp} className="grid grid-cols-12 gap-4 mb-24">
						{Array.isArray(testimonials) &&
							testimonials.map((testimonial, idx) => {
								// Vary card sizes for visual interest
								const sizes = ["col-span-12 lg:col-span-5", "col-span-12 lg:col-span-7", "col-span-12"];

								return (
									<motion.div key={idx} variants={fadeInUp} transition={{ delay: idx * 0.1 }} className={sizes[idx]}>
										<div className="h-full bg-surface border border-border rounded-2xl p-8 lg:p-10 shadow-soft">
											{/* Quote mark */}
											<div className="mb-6">
												<svg className="w-8 h-8 text-muted-foreground/20" fill="currentColor" viewBox="0 0 24 24">
													<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
												</svg>
											</div>

											<p className="text-foreground leading-relaxed mb-6 text-base lg:text-lg">{testimonial.quote}</p>

											<div className="flex items-center gap-3">
												{/* Avatar placeholder */}
												<div className="w-10 h-10 rounded-full bg-muted" />
												<div>
													<p className="text-sm font-medium">{testimonial.author}</p>
													<p className="text-xs text-muted-foreground">{testimonial.company}</p>
												</div>
											</div>
										</div>
									</motion.div>
								);
							})}
					</motion.div>

					{/* Guarantees */}
					<motion.div variants={fadeInUp}>
						<div className="bg-card border border-border rounded-2xl p-8 lg:p-10 shadow-soft">
							<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
								<div className="max-w-md">
									<h3 className="text-lg font-medium mb-2">{t("hire.proof.guarantees.title")}</h3>
									<p className="text-sm text-muted-foreground">{t("hire.proof.guarantees.description")}</p>
								</div>
								<div className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
									{Array.isArray(guarantees) &&
										guarantees.map((guarantee, idx) => (
											<div key={idx} className="flex items-center gap-2.5 text-sm">
												<Check className="h-4 w-4 text-muted-foreground" />
												<span className="text-muted-foreground">{guarantee}</span>
											</div>
										))}
								</div>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}


