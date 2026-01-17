"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ArrowUpRight, Star, Check, Users } from "lucide-react";

export function HeroSection() {
	const { t, i18n } = useTranslation();
	const isRTL = i18n.language === "ar";
	const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		element?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<section className="relative min-h-[85vh] flex items-center py-12 lg:py-20 overflow-hidden">
			<div className="container-narrow">
				{/* Hero Grid - 2 columns per PRD */}
				<div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
					{/* Left Column - Copy & Actions */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
						className="relative z-10"
					>
						{/* User Badge */}
						<motion.div 
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1, duration: 0.5 }}
							className="flex items-center gap-3 mb-8"
						>
							<div className="flex items-center">
								{/* Avatar group */}
								<div className="flex -space-x-2">
								<div className="w-8 h-8 rounded-full bg-linear-to-br from-accent-orange to-orange-600 border-2 border-card flex items-center justify-center">
									<Users className="w-4 h-4 text-white" />
								</div>
								<div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-700 to-gray-900 border-2 border-card" />
								<div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-500 to-gray-700 border-2 border-card" />
								</div>
							</div>
							<div>
								<span className="font-semibold text-foreground">{t("hero.stats.activeBuilders.value")} {t("hero.stats.activeBuilders.label")}</span>
							</div>
						</motion.div>

						{/* Main Headline - Serif font per PRD */}
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2, duration: 0.6 }}
							className="font-serif text-6xl sm:text-7xl lg:text-8xl xl:text-[100px] font-medium tracking-tight leading-[0.95] mb-6"
						>
							{t("hero.headline")}
							<sup className="text-accent-orange text-3xl sm:text-4xl lg:text-5xl relative top-[-0.5em] ml-1">+</sup>
						</motion.h1>

						{/* Divider */}
						<motion.div
							initial={{ opacity: 0, scaleX: 0 }}
							animate={{ opacity: 1, scaleX: 1 }}
							transition={{ delay: 0.3, duration: 0.5 }}
							className="w-full h-px bg-border mb-6 origin-left"
						/>

						{/* Sub-headline */}
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.5 }}
							className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md"
						>
							{t("hero.subheadline")}
						</motion.p>

						{/* Social Proof Review */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5, duration: 0.5 }}
							className="flex items-center gap-3 mb-10"
						>
							<div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
							<div className="flex-1">
								<p className="text-sm text-muted-foreground leading-snug">
									&ldquo;{t("hero.quote.text")}&rdquo;
								</p>
							</div>
							<div className="flex items-center gap-1 shrink-0">
								<Star className="w-4 h-4 fill-accent-orange text-accent-orange" />
								<span className="font-semibold text-sm">5.0</span>
							</div>
						</motion.div>

						{/* Action Row */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6, duration: 0.5 }}
							className="flex items-center gap-6"
						>
							<Button
								size="lg"
								onClick={() => scrollToSection("apply")}
								className="bg-foreground hover:bg-foreground/90 text-background font-medium h-14 px-8 text-base rounded-full transition-all duration-200 gap-2 shadow-soft"
							>
								{t("hero.primaryCta")}
								<ArrowIcon className="h-4 w-4" />
							</Button>
							<button
								onClick={() => scrollToSection("roles")}
								className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
							>
								<span className="font-medium">{t("hero.secondaryCta")}</span>
								<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
							</button>
						</motion.div>
					</motion.div>

					{/* Right Column - Visual Composition */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
						className="relative lg:ps-8"
					>
						<div className="relative aspect-4/5 max-w-lg mx-auto lg:mx-0 lg:ms-auto">
							{/* Orange Background Shape */}
							<div className="absolute inset-0 bg-accent-gradient rounded-[2rem] lg:rounded-[3rem] z-0" />
							
							{/* Main Image - Person/Monument */}
							<div className="absolute inset-0 z-10 flex items-end justify-center overflow-hidden rounded-[2rem] lg:rounded-[3rem]">
								<Image
									src="/hero-man.jpg"
									alt="Jeem talent"
									width={500}
									height={600}
									className="object-cover object-top w-full h-full"
									priority
								/>
							</div>

							{/* Play Button - Center */}
							{/* <motion.button
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.8, duration: 0.4 }}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-soft cursor-pointer"
							>
								<Play className="w-6 h-6 text-foreground fill-foreground ms-1" />
							</motion.button> */}

							{/* Metric Card - Top Right */}
							<motion.div
								initial={{ opacity: 0, x: 20, y: -20 }}
								animate={{ opacity: 1, x: 0, y: 0 }}
								transition={{ delay: 0.9, duration: 0.5 }}
								className="absolute -top-4 -end-4 lg:top-8 lg:-end-8 z-20 glass-card-strong rounded-2xl p-5 min-w-[140px]"
							>
								<p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">UP TO</p>
								<p className="text-4xl font-semibold text-foreground mb-1">{t("hero.stats.satisfaction.value")}</p>
								<p className="text-sm text-muted-foreground">{t("hero.stats.satisfaction.label")}</p>
							</motion.div>

							{/* Product/Role Card - Bottom Right */}
							<motion.div
								initial={{ opacity: 0, x: 20, y: 20 }}
								animate={{ opacity: 1, x: 0, y: 0 }}
								transition={{ delay: 1, duration: 0.5 }}
								className="absolute -bottom-4 -end-4 lg:bottom-12 lg:-end-8 z-20 glass-card-strong rounded-2xl p-4 flex items-center gap-3"
							>
								<div className="w-14 h-14 rounded-xl bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
									<Image
										src="/sword-monument.jpg"
										alt="Work"
										width={56}
										height={56}
										className="object-cover"
									/>
								</div>
								<div>
									<p className="font-medium text-foreground text-sm">{t("hero.latestMatch.role")}</p>
									<p className="text-xs text-muted-foreground">{t("hero.latestMatch.time")}</p>
									<div className="flex items-center gap-1 mt-1">
										<Star className="w-3 h-3 fill-accent-orange text-accent-orange" />
										<span className="text-xs font-medium">4.8</span>
									</div>
								</div>
							</motion.div>

							{/* Chat Bubbles - Left Side */}
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 1.1, duration: 0.5 }}
								className="absolute top-1/4 -start-4 lg:-start-12 z-20 flex flex-col gap-2"
							>
								<div className="glass-card-strong rounded-full py-2.5 px-4 flex items-center gap-2 shadow-soft">
									<Check className="w-4 h-4 text-green-500" />
									<span className="text-sm text-foreground whitespace-nowrap">{t("hero.trustPills.remoteFriendly")}</span>
								</div>
								<div className="glass-card-strong rounded-full py-2.5 px-4 flex items-center gap-2 shadow-soft">
									<Check className="w-4 h-4 text-green-500" />
									<span className="text-sm text-foreground whitespace-nowrap">{t("hero.trustPills.paidInUsd")}</span>
								</div>
							</motion.div>

							{/* Stats Card - Bottom Left */}
							<motion.div
								initial={{ opacity: 0, y: 20, x: -20 }}
								animate={{ opacity: 1, y: 0, x: 0 }}
								transition={{ delay: 1.2, duration: 0.5 }}
								className="absolute bottom-1/4 -start-4 lg:-start-16 z-20 glass-card-strong rounded-2xl p-4"
							>
								<p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t("hero.thisWeek.title")}</p>
								<p className="font-semibold text-foreground">{t("hero.thisWeek.opportunities")}</p>
								<p className="text-sm text-muted-foreground">{t("hero.thisWeek.categories")}</p>
							</motion.div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
