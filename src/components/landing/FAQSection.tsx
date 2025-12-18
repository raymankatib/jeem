"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CONFIG } from "@/lib/config";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function FAQSection() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section id="faq" className="py-24 bg-charcoal relative" ref={ref}>
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="text-center mb-12">
						<Badge variant="secondary" className="mb-4 bg-amber/10 text-amber border-amber/20">
							FAQ
						</Badge>
						<h2 className="text-3xl sm:text-4xl font-bold mb-4">Common questions</h2>
						<p className="text-muted-foreground">Everything you need to know about joining Jeem.</p>
					</motion.div>

					{/* Accordion */}
					<motion.div variants={fadeInUp}>
						<Accordion type="single" collapsible className="space-y-3">
							{CONFIG.faq.map((item, idx) => (
								<AccordionItem
									key={idx}
									value={`item-${idx}`}
									className="border border-border rounded-lg px-6 bg-secondary/20 data-[state=open]:bg-secondary/40"
								>
									<AccordionTrigger className="text-left hover:no-underline py-5">
										<span className="font-medium">{item.question}</span>
									</AccordionTrigger>
									<AccordionContent className="text-muted-foreground pb-5">{item.answer}</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}

