"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CONFIG } from "@/lib/config";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function HowItWorksSection() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section id="how-it-works" className="py-32 relative bg-noise" ref={ref}>
			<div className="container-narrow">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="max-w-2xl mb-20">
						<p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">Process</p>
						<h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">How Jeem works for you</h2>
						<p className="text-muted-foreground text-lg leading-relaxed">
							A straightforward process designed to be fair and transparent. Your portfolio and examples matter more
							than credentials.
						</p>
					</motion.div>

					{/* Steps - Horizontal timeline on desktop, vertical on mobile */}
					<motion.div variants={fadeInUp} className="relative">
						{/* Desktop: Horizontal Layout */}
						<div className="hidden lg:grid lg:grid-cols-5 gap-0">
							{CONFIG.howItWorks.steps.map((step, idx) => (
								<motion.div
									key={step.number}
									variants={fadeInUp}
									transition={{ delay: idx * 0.08 }}
									className="relative"
								>
									{/* Connector line */}
									{idx < CONFIG.howItWorks.steps.length - 1 && (
										<div className="absolute top-6 left-[calc(50%+24px)] right-0 h-px bg-border" />
									)}

									<div className="flex flex-col items-center text-center px-4">
										{/* Step number */}
										<div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mb-6 relative z-10 shadow-soft">
											<span className="text-sm font-medium text-muted-foreground">{step.number}</span>
										</div>

										{/* Content */}
										<h3 className="text-base font-medium mb-2">{step.title}</h3>
										<p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
									</div>
								</motion.div>
							))}
						</div>

						{/* Mobile: Vertical Layout */}
						<div className="lg:hidden space-y-0">
							{CONFIG.howItWorks.steps.map((step, idx) => (
								<motion.div
									key={step.number}
									variants={fadeInUp}
									transition={{ delay: idx * 0.08 }}
									className="relative flex gap-6"
								>
									{/* Left side: Number and connector */}
									<div className="flex flex-col items-center">
										<div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft relative z-10">
											<span className="text-sm font-medium text-muted-foreground">{step.number}</span>
										</div>
										{idx < CONFIG.howItWorks.steps.length - 1 && <div className="w-px h-full bg-border flex-1 my-2" />}
									</div>

									{/* Right side: Content */}
									<div className="pb-12 flex-1">
										<h3 className="text-base font-medium mb-2">{step.title}</h3>
										<p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
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
