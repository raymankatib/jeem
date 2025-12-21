"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { CONFIG } from "@/lib/config";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function ProofSection() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section id="proof" className="py-32 relative bg-noise" ref={ref}>
			<div className="container-narrow">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="max-w-2xl mb-20">
						<p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">Our Values</p>
						<h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">What we value</h2>
						<p className="text-muted-foreground text-lg leading-relaxed">
							The principles that guide who we work with and how we operate.
						</p>
					</motion.div>

					{/* Values - Bento layout with mixed sizes */}
					<motion.div variants={fadeInUp} className="grid grid-cols-12 gap-4 mb-24">
						{CONFIG.proof.values.map((value, idx) => {
							// Create asymmetrical layout
							const sizes = [
								"col-span-12 sm:col-span-6 lg:col-span-3",
								"col-span-12 sm:col-span-6 lg:col-span-3",
								"col-span-12 sm:col-span-6 lg:col-span-3",
								"col-span-12 sm:col-span-6 lg:col-span-3"
							];

							return (
								<motion.div
									key={value.title}
									variants={fadeInUp}
									transition={{ delay: idx * 0.06 }}
									className={sizes[idx]}
								>
									<div className="h-full bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-soft text-center">
										<h3 className="text-lg font-medium mb-2">{value.title}</h3>
										<p className="text-sm text-muted-foreground">{value.description}</p>
									</div>
								</motion.div>
							);
						})}
					</motion.div>

					{/* Testimonials - Mixed card sizes */}
					<motion.div variants={fadeInUp} className="grid grid-cols-12 gap-4 mb-24">
						{CONFIG.proof.testimonials.map((testimonial, idx) => {
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
											<p className="text-sm text-muted-foreground">— {testimonial.role}</p>
										</div>
									</div>
								</motion.div>
							);
						})}
					</motion.div>

					{/* Jeem Standards - Subtle, understated */}
					<motion.div variants={fadeInUp}>
						<div className="bg-card border border-border rounded-2xl p-8 lg:p-10 shadow-soft">
							<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
								<div className="max-w-md">
									<h3 className="text-lg font-medium mb-2">Jeem Standards</h3>
									<p className="text-sm text-muted-foreground">The bar we hold ourselves to.</p>
								</div>
								<div className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
									{CONFIG.proof.standards.map((standard, idx) => (
										<div key={idx} className="flex items-center gap-2.5 text-sm">
											<Check className="h-4 w-4 text-muted-foreground" />
											<span className="text-muted-foreground">{standard}</span>
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
