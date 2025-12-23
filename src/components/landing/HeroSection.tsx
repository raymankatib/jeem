"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Globe, DollarSign, Users, Award, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer, slideInFromRight } from "@/lib/animations";

export function HeroSection() {
	const { t, i18n } = useTranslation();
	const isRTL = i18n.language === "ar";
	const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		element?.scrollIntoView({ behavior: "smooth" });
	};

	const trustPills = [
		{ icon: Globe, key: "remoteFriendly" },
		{ icon: DollarSign, key: "paidInUsd" },
		{ icon: Users, key: "seriousTeams" },
		{ icon: Award, key: "portfolioFirst" }
	];

	return (
		<section className="relative min-h-screen flex items-center pt-16 bg-noise">
			<div className="container-narrow py-24 lg:py-32">
				<div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
					{/* Text Content */}
					<motion.div
						initial="hidden"
						animate="visible"
						variants={staggerContainer}
						className="lg:col-span-6 xl:col-span-5"
					>
						{/* Kicker */}
						<motion.div variants={fadeInUp} className="mb-6">
							<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/60 text-sm text-muted-foreground">
								<Sparkles className="h-4 w-4 text-foreground/70" />
								<span className="font-medium text-foreground/80">{t("hero.kicker")}</span>
							</div>
						</motion.div>

						{/* Headline */}
						<motion.h1
							variants={fadeInUp}
							className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6"
						>
							{t("hero.headline")}
							<br />
							<span className="text-muted-foreground">{t("hero.headlineAccent")}</span>
						</motion.h1>

						{/* Subheadline */}
						<motion.p variants={fadeInUp} className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
							{t("hero.subheadline")}
						</motion.p>

						{/* CTAs */}
						<motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 mb-12">
							<Button
								size="lg"
								onClick={() => scrollToSection("apply")}
								className="bg-foreground hover:bg-foreground/90 text-background font-medium h-12 px-8 text-base transition-opacity duration-200 gap-2"
							>
								{t("hero.primaryCta")}
								<ArrowIcon className="h-4 w-4" />
							</Button>
							<Button
								size="lg"
								variant="ghost"
								onClick={() => scrollToSection("roles")}
								className="text-muted-foreground hover:text-foreground hover:bg-transparent h-12 px-6 text-base transition-colors duration-200"
							>
								{t("hero.secondaryCta")}
							</Button>
						</motion.div>

						{/* Trust Pills */}
						<motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
							{trustPills.map((pill) => (
								<div
									key={pill.key}
									className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-sm text-muted-foreground"
								>
									<pill.icon className="h-3.5 w-3.5" />
									<span>{t(`hero.trustPills.${pill.key}`)}</span>
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
										<span className="text-sm text-muted-foreground">{t("hero.stats.title")}</span>
										<div className="w-2 h-2 rounded-full bg-green-500" />
									</div>
									<div className="grid grid-cols-3 gap-6">
										<div>
											<div className="text-3xl font-semibold mb-1">{t("hero.stats.activeBuilders.value")}</div>
											<div className="text-sm text-muted-foreground">{t("hero.stats.activeBuilders.label")}</div>
										</div>
										<div>
											<div className="text-3xl font-semibold mb-1">{t("hero.stats.teamsServed.value")}</div>
											<div className="text-sm text-muted-foreground">{t("hero.stats.teamsServed.label")}</div>
										</div>
										<div>
											<div className="text-3xl font-semibold mb-1">{t("hero.stats.satisfaction.value")}</div>
											<div className="text-sm text-muted-foreground">{t("hero.stats.satisfaction.label")}</div>
										</div>
									</div>
								</div>

								{/* Role preview card */}
								<div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
									<div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
										{t("hero.latestMatch.title")}
									</div>
									<div className="font-medium mb-1">{t("hero.latestMatch.role")}</div>
									<div className="text-sm text-muted-foreground">{t("hero.latestMatch.time")}</div>
								</div>

								{/* Activity card */}
								<div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
									<div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
										{t("hero.thisWeek.title")}
									</div>
									<div className="font-medium mb-1">{t("hero.thisWeek.opportunities")}</div>
									<div className="text-sm text-muted-foreground">{t("hero.thisWeek.categories")}</div>
								</div>

								{/* Quote snippet */}
								<div className="col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-soft">
									<div className="flex gap-4">
										<div className="w-10 h-10 rounded-full bg-muted shrink-0" />
										<div>
											<p className="text-sm text-muted-foreground leading-relaxed mb-2">
												&ldquo;{t("hero.quote.text")}&rdquo;
											</p>
											<p className="text-xs text-muted-foreground">{t("hero.quote.author")}</p>
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
