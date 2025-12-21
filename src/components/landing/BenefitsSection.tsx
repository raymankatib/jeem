"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONFIG } from "@/lib/config";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function BenefitsSection() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section id="benefits" className="py-24 bg-charcoal relative" ref={ref}>
			{/* Background accent */}
			<div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber/5 rounded-full blur-[120px]" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="text-center mb-16">
						<Badge variant="secondary" className="mb-4 bg-amber/10 text-amber border-amber/20">
							Benefits
						</Badge>
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Why builders choose Jeem</h2>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
							We&apos;ve built the network we wished existed. Here&apos;s what you get.
						</p>
					</motion.div>

					{/* Benefits Grid */}
					<motion.div variants={fadeInUp} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{CONFIG.benefits.map((benefit, idx) => (
							<motion.div key={benefit.title} variants={fadeInUp} transition={{ delay: idx * 0.1 }}>
								<Card className="h-full bg-secondary/20 border-border hover:border-amber/30 transition-all group">
									<CardContent className="pt-8 pb-6 px-6">
										<div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-6 group-hover:bg-amber/20 transition-colors">
											<benefit.icon className="h-6 w-6 text-amber" />
										</div>
										<h3 className="text-lg font-semibold mb-3">{benefit.title}</h3>
										<p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
