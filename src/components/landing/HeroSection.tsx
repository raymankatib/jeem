"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CONFIG } from "@/lib/config";
import { fadeInUp, staggerContainer, slideInFromRight } from "@/lib/animations";

export function HeroSection() {
	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		element?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<section className="relative min-h-screen flex items-center pt-16 bg-noise">
			<div className="container-narrow py-24 lg:py-32">
				<div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
					{/* Left Column - Text Content */}
					<motion.div
						initial="hidden"
						animate="visible"
						variants={staggerContainer}
						className="lg:col-span-6 xl:col-span-5"
					>
						{/* Headline */}
						<motion.h1
							variants={fadeInUp}
							className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6"
						>
							{CONFIG.hero.headline}
							<br />
							<span className="text-muted-foreground">{CONFIG.hero.headlineAccent}</span>
						</motion.h1>

						{/* Subheadline */}
						<motion.p variants={fadeInUp} className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
							{CONFIG.hero.subheadline}
						</motion.p>

						{/* CTAs */}
						<motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 mb-12">
							<Button
								size="lg"
								onClick={() => scrollToSection("apply")}
								className="bg-foreground hover:bg-foreground/90 text-background font-medium h-12 px-8 text-base transition-opacity duration-200"
							>
								{CONFIG.hero.primaryCta}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
							<Button
								size="lg"
								variant="ghost"
								onClick={() => scrollToSection("roles")}
								className="text-muted-foreground hover:text-foreground hover:bg-transparent h-12 px-6 text-base transition-colors duration-200"
							>
								{CONFIG.hero.secondaryCta}
							</Button>
						</motion.div>

						{/* Trust Pills */}
						<motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
							{CONFIG.hero.trustPills.map((pill) => (
								<div
									key={pill.text}
									className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-sm text-muted-foreground"
								>
									<pill.icon className="h-3.5 w-3.5" />
									<span>{pill.text}</span>
								</div>
							))}
						</motion.div>
					</motion.div>

					{/* Right Column - Visual Panel (Bento-style preview) */}
					<motion.div
						initial="hidden"
						animate="visible"
						variants={slideInFromRight}
						className="lg:col-span-6 xl:col-span-7"
					>
						<div className="relative">
							{/* Main Card - Asymmetrical bento layout */}
							<div className="grid grid-cols-2 gap-3">
								{/* Large stat card */}
								<div className="col-span-2 bg-card border border-border rounded-2xl p-8 shadow-soft">
									<div className="flex items-center justify-between mb-6">
										<span className="text-sm text-muted-foreground">Network Stats</span>
										<div className="w-2 h-2 rounded-full bg-green-500" />
									</div>
									<div className="grid grid-cols-3 gap-6">
										<div>
											<div className="text-3xl font-semibold mb-1">150+</div>
											<div className="text-sm text-muted-foreground">Active builders</div>
										</div>
										<div>
											<div className="text-3xl font-semibold mb-1">40+</div>
											<div className="text-sm text-muted-foreground">Teams served</div>
										</div>
										<div>
											<div className="text-3xl font-semibold mb-1">98%</div>
											<div className="text-sm text-muted-foreground">Satisfaction</div>
										</div>
									</div>
								</div>

								{/* Role preview card */}
								<div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
									<div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Latest Match</div>
									<div className="font-medium mb-1">Vibe Coding Engineer</div>
									<div className="text-sm text-muted-foreground">Matched 2 days ago</div>
								</div>

								{/* Activity card */}
								<div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
									<div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">This Week</div>
									<div className="font-medium mb-1">12 new opportunities</div>
									<div className="text-sm text-muted-foreground">Across 5 categories</div>
								</div>

								{/* Quote snippet */}
								<div className="col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-soft">
									<div className="flex gap-4">
										<div className="w-10 h-10 rounded-full bg-muted shrink-0" />
										<div>
											<p className="text-sm text-muted-foreground leading-relaxed mb-2">
												&ldquo;Finally, a network that respects my time and matches me with projects worth doing.&rdquo;
											</p>
											<p className="text-xs text-muted-foreground">— Senior Developer</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
