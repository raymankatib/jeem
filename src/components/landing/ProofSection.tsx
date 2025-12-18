"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Shield } from "lucide-react";
import { CONFIG } from "@/lib/config";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function ProofSection() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section id="proof" className="py-24 relative" ref={ref}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="text-center mb-16">
						<Badge variant="secondary" className="mb-4 bg-amber/10 text-amber border-amber/20">
							Our Values
						</Badge>
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">What we value</h2>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
							The principles that guide who we work with and how we operate.
						</p>
					</motion.div>

					{/* Values */}
					<motion.div variants={fadeInUp} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
						{CONFIG.proof.values.map((value, idx) => (
							<motion.div
								key={value.title}
								variants={fadeInUp}
								transition={{ delay: idx * 0.1 }}
								className="text-center p-6 rounded-xl bg-secondary/20 border border-border"
							>
								<h3 className="text-xl font-bold text-amber mb-2">{value.title}</h3>
								<p className="text-muted-foreground text-sm">{value.description}</p>
							</motion.div>
						))}
					</motion.div>

					{/* Testimonials */}
					<motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-6 mb-16">
						{CONFIG.proof.testimonials.map((testimonial, idx) => (
							<motion.div key={idx} variants={fadeInUp} transition={{ delay: idx * 0.15 }}>
								<Card className="h-full bg-charcoal border-border">
									<CardContent className="pt-8 pb-6 px-6">
										<div className="mb-6">
											<svg className="w-8 h-8 text-amber/30" fill="currentColor" viewBox="0 0 24 24">
												<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
											</svg>
										</div>
										<p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
										<p className="text-sm text-muted-foreground">— {testimonial.role}</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>

					{/* Jeem Standards */}
					<motion.div variants={fadeInUp}>
						<Card className="bg-gradient-to-br from-amber/10 to-transparent border-amber/20">
							<CardContent className="py-8 px-8">
								<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
									<div>
										<h3 className="text-xl font-bold mb-2 flex items-center gap-2">
											<Shield className="h-5 w-5 text-amber" />
											Jeem Standards
										</h3>
										<p className="text-muted-foreground">The bar we hold ourselves to.</p>
									</div>
									<div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
										{CONFIG.proof.standards.map((standard, idx) => (
											<div key={idx} className="flex items-center gap-2 text-sm">
												<CheckCircle2 className="h-4 w-4 text-amber" />
												<span>{standard}</span>
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}

