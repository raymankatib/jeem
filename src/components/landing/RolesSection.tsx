"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Sparkles } from "lucide-react";
import { CONFIG } from "@/lib/config";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function RolesSection() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section id="roles" className="py-24 bg-charcoal relative" ref={ref}>
			{/* Background accents */}
			<div className="absolute top-0 right-0 w-72 h-72 bg-amber/5 rounded-full blur-[100px]" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="text-center mb-16">
						<Badge variant="secondary" className="mb-4 bg-amber/10 text-amber border-amber/20">
							Open Roles
						</Badge>
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Find your place in the network</h2>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
							We're looking for specialists who ship. Pick your domain and show us what you've built.
						</p>
					</motion.div>

					{/* Roles Tabs */}
					<motion.div variants={fadeInUp}>
						<Tabs defaultValue="engineering" className="w-full">
							<TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto mb-8">
								{CONFIG.roles.categories.map((category) => (
									<TabsTrigger
										key={category.id}
										value={category.id}
										className="data-[state=active]:bg-amber data-[state=active]:text-white dark:data-[state=active]:text-background px-6 py-3 rounded-lg border border-border data-[state=active]:border-amber"
									>
										<category.icon className="h-4 w-4 mr-2" />
										{category.label}
									</TabsTrigger>
								))}
							</TabsList>

							{CONFIG.roles.categories.map((category) => (
								<TabsContent key={category.id} value={category.id}>
									<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
										{category.roles.map((role, idx) => (
											<motion.div
												key={role.title}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: idx * 0.1 }}
											>
												<Card className="h-full bg-secondary/30 border-border hover:border-amber/30 transition-colors group">
													<CardHeader>
														<CardTitle className="text-xl group-hover:text-amber transition-colors">
															{role.title}
														</CardTitle>
													</CardHeader>
													<CardContent className="space-y-6">
														{/* What you'll do */}
														<div>
															<h4 className="text-sm font-medium text-amber mb-2">What you'll do</h4>
															<ul className="space-y-2">
																{role.whatYouDo.map((item, i) => (
																	<li key={i} className="flex gap-2 text-sm text-muted-foreground">
																		<CheckCircle2 className="h-4 w-4 text-amber shrink-0 mt-0.5" />
																		<span>{item}</span>
																	</li>
																))}
															</ul>
														</div>

														{/* What good looks like */}
														<div>
															<h4 className="text-sm font-medium text-amber mb-2">What "good" looks like</h4>
															<ul className="space-y-2">
																{role.whatGoodLooksLike.map((item, i) => (
																	<li key={i} className="flex gap-2 text-sm text-muted-foreground">
																		<Sparkles className="h-4 w-4 text-amber shrink-0 mt-0.5" />
																		<span>{item}</span>
																	</li>
																))}
															</ul>
														</div>

														{/* Tools */}
														<div>
															<h4 className="text-sm font-medium text-muted-foreground mb-2">
																Tools you'll likely use
															</h4>
															<div className="flex flex-wrap gap-2">
																{role.tools.map((tool) => (
																	<Badge
																		key={tool}
																		variant="secondary"
																		className="bg-background/50 border-border text-xs"
																	>
																		{tool}
																	</Badge>
																))}
															</div>
														</div>
													</CardContent>
												</Card>
											</motion.div>
										))}
									</div>
								</TabsContent>
							))}
						</Tabs>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
