"use client";

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function FAQSection() {
	const { t } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	const faqItems = t("faq.items", { returnObjects: true }) as Array<{ question: string; answer: string }>;

	return (
		<section id="faq" className="py-32 bg-surface relative bg-noise" ref={ref}>
			<div className="container-narrow">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Two-column layout */}
					<div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
						{/* Left Column - Header */}
						<motion.div variants={fadeInUp} className="lg:col-span-4">
							<div className="lg:sticky lg:top-24">
								<p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">{t("faq.sectionLabel")}</p>
								<h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">{t("faq.title")}</h2>
								<p className="text-muted-foreground leading-relaxed">{t("faq.description")}</p>
							</div>
						</motion.div>

						{/* Right Column - Accordion */}
						<motion.div variants={fadeInUp} className="lg:col-span-8">
							<Accordion type="single" collapsible className="space-y-3">
								{Array.isArray(faqItems) &&
									faqItems.map((item, idx) => (
										<AccordionItem
											key={idx}
											value={`item-${idx}`}
											className="border border-border rounded-xl px-6 bg-card data-[state=open]:bg-card shadow-soft"
										>
											<AccordionTrigger className="text-left hover:no-underline py-5 text-base font-normal cursor-pointer">
												{item.question}
											</AccordionTrigger>
											<AccordionContent className="text-muted-foreground pb-5 text-sm leading-relaxed">
												{item.answer}
											</AccordionContent>
										</AccordionItem>
									))}
							</Accordion>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
