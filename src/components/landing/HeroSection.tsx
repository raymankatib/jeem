"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";
import { CONFIG } from "@/lib/config";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function HeroSection() {
	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		element?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0 bg-linear-to-b from-background via-background to-charcoal" />

			{/* Noise texture overlay */}
			<div className="absolute inset-0 bg-noise pointer-events-none" />

			{/* Ambient glow effects */}
			<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber/10 rounded-full blur-[120px]" />
			<div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-amber/5 rounded-full blur-[100px]" />

			{/* Subtle grid pattern - theme aware */}
			<div
				className="absolute inset-0 opacity-[0.02] dark:opacity-[0.02]"
				style={{
					backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
					backgroundSize: "60px 60px"
				}}
			/>

			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
				<motion.div
					initial="hidden"
					animate="visible"
					variants={staggerContainer}
					className="text-center max-w-4xl mx-auto"
				>
					{/* Headline */}
					<motion.h1
						variants={fadeInUp}
						transition={{ duration: 0.6 }}
						className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
					>
						{CONFIG.hero.headline}
						<br />
						<span className="text-gradient-amber">{CONFIG.hero.headlineAccent}</span>
					</motion.h1>

					{/* Subheadline */}
					<motion.p
						variants={fadeInUp}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
					>
						{CONFIG.hero.subheadline}
					</motion.p>

					{/* CTAs */}
					<motion.div
						variants={fadeInUp}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
					>
						<Button
							size="lg"
							onClick={() => scrollToSection("apply")}
							className="bg-amber hover:bg-amber-dark text-white dark:text-background font-semibold px-8 py-6 text-lg glow-amber"
						>
							{CONFIG.hero.primaryCta}
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button
							size="lg"
							variant="outline"
							onClick={() => scrollToSection("roles")}
							className="border-border hover:bg-secondary px-8 py-6 text-lg"
						>
							{CONFIG.hero.secondaryCta}
							<ChevronRight className="ml-2 h-5 w-5" />
						</Button>
					</motion.div>

					{/* Trust Pills */}
					<motion.div
						variants={fadeInUp}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="flex flex-wrap justify-center gap-3"
					>
						{CONFIG.hero.trustPills.map((pill) => (
							<div
								key={pill.text}
								className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border text-sm text-muted-foreground"
							>
								<pill.icon className="h-4 w-4 text-amber" />
								<span>{pill.text}</span>
							</div>
						))}
					</motion.div>
				</motion.div>
			</div>

			{/* Scroll indicator */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1, duration: 0.5 }}
				className="absolute bottom-8 left-1/2 -translate-x-1/2"
			>
				<motion.div
					animate={{ y: [0, 8, 0] }}
					transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
					className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
				>
					<div className="w-1.5 h-2.5 rounded-full bg-amber" />
				</motion.div>
			</motion.div>
		</section>
	);
}
