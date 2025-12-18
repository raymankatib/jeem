"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONFIG } from "@/lib/config";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function HowItWorksSection() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section id="how-it-works" className="py-24 relative" ref={ref}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="text-center mb-16">
						<Badge variant="secondary" className="mb-4 bg-amber/10 text-amber border-amber/20">
							Process
						</Badge>
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">How Jeem works for you</h2>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
							A straightforward process designed to be fair and transparent. Your portfolio and examples matter more
							than credentials.
						</p>
					</motion.div>

					{/* Steps */}
					<motion.div variants={fadeInUp} className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-5">
						{CONFIG.howItWorks.steps.map((step, idx) => (
							<motion.div key={step.number} variants={fadeInUp} transition={{ delay: idx * 0.1 }} className="relative">
								<Card className="h-full bg-secondary/20 border-border hover:border-amber/30 transition-all group">
									<CardContent className="pt-8 pb-6 px-5">
										{/* Step number */}
										<div className="absolute -top-4 left-5">
											<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber to-amber-dark flex items-center justify-center text-white dark:text-background text-sm font-bold glow-amber group-hover:glow-amber-lg transition-shadow">
												{step.number}
											</div>
										</div>

										{/* Icon */}
										<div className="flex justify-end mb-4">
											<step.icon className="h-5 w-5 text-muted-foreground group-hover:text-amber transition-colors" />
										</div>

										<h3 className="text-lg font-semibold mb-2">{step.title}</h3>
										<p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
									</CardContent>
								</Card>

								{/* Connector line */}
								{idx < CONFIG.howItWorks.steps.length - 1 && (
									<div className="hidden xl:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-amber/50 to-transparent" />
								)}
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
