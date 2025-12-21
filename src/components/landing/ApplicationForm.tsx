"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Zap } from "lucide-react";
import { CONFIG } from "@/lib/config";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function ApplicationForm() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		role: "",
		portfolio: "",
		shipped: "",
		tools: ""
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.name.trim()) {
			toast.error("Please enter your full name");
			return;
		}
		if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			toast.error("Please enter a valid email address");
			return;
		}
		if (!formData.role) {
			toast.error("Please select a role");
			return;
		}
		if (!formData.portfolio.trim()) {
			toast.error("Please provide a portfolio, LinkedIn, or GitHub URL");
			return;
		}
		if (!formData.shipped.trim()) {
			toast.error("Please tell us what you've shipped recently");
			return;
		}

		setIsSubmitting(true);

		// Simulate submission
		await new Promise((resolve) => setTimeout(resolve, 1500));

		toast.success("Application submitted successfully!", {
			description: "We'll review your application and get back to you soon."
		});

		setFormData({
			name: "",
			email: "",
			role: "",
			portfolio: "",
			shipped: "",
			tools: ""
		});
		setIsSubmitting(false);
	};

	return (
		<section id="apply" className="py-24 relative" ref={ref}>
			{/* Background accent */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber/5 rounded-full blur-[150px]" />

			<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Section Header */}
					<motion.div variants={fadeInUp} className="text-center mb-12">
						<Badge variant="secondary" className="mb-4 bg-amber/10 text-amber border-amber/20">
							Apply Now
						</Badge>
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Ready to join?</h2>
						<p className="text-muted-foreground text-lg">
							Show us what you&apos;ve shipped. We review every application personally.
						</p>
					</motion.div>

					{/* Form */}
					<motion.div variants={fadeInUp}>
						<Card className="bg-charcoal border-border">
							<CardContent className="p-8">
								<form onSubmit={handleSubmit} className="space-y-6">
									{/* Name */}
									<div className="space-y-2">
										<label htmlFor="name" className="text-sm font-medium">
											Full name <span className="text-amber">*</span>
										</label>
										<Input
											id="name"
											type="text"
											placeholder="Your full name"
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											className="bg-secondary/50 border-border focus:border-amber"
										/>
									</div>

									{/* Email */}
									<div className="space-y-2">
										<label htmlFor="email" className="text-sm font-medium">
											Email <span className="text-amber">*</span>
										</label>
										<Input
											id="email"
											type="email"
											placeholder="you@example.com"
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											className="bg-secondary/50 border-border focus:border-amber"
										/>
									</div>

									{/* Role */}
									<div className="space-y-2">
										<label htmlFor="role" className="text-sm font-medium">
											Role <span className="text-amber">*</span>
										</label>
										<Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
											<SelectTrigger className="bg-secondary/50 border-border focus:border-amber">
												<SelectValue placeholder="Select the role you're applying for" />
											</SelectTrigger>
											<SelectContent>
												{CONFIG.roles_list.map((role) => (
													<SelectItem key={role} value={role}>
														{role}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{/* Portfolio */}
									<div className="space-y-2">
										<label htmlFor="portfolio" className="text-sm font-medium">
											Portfolio / LinkedIn / GitHub <span className="text-amber">*</span>
										</label>
										<Input
											id="portfolio"
											type="url"
											placeholder="https://..."
											value={formData.portfolio}
											onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
											className="bg-secondary/50 border-border focus:border-amber"
										/>
									</div>

									{/* What you've shipped */}
									<div className="space-y-2">
										<label htmlFor="shipped" className="text-sm font-medium">
											Tell us what you&apos;ve shipped recently <span className="text-amber">*</span>
										</label>
										<Textarea
											id="shipped"
											placeholder="Share a recent project, feature, or piece of work you're proud of. Be specific about your role and the outcome."
											rows={4}
											value={formData.shipped}
											onChange={(e) => setFormData({ ...formData, shipped: e.target.value })}
											className="bg-secondary/50 border-border focus:border-amber resize-none"
										/>
									</div>

									{/* Tools (optional) */}
									<div className="space-y-2">
										<label htmlFor="tools" className="text-sm font-medium">
											Your strongest tools <span className="text-muted-foreground">(optional)</span>
										</label>
										<Input
											id="tools"
											type="text"
											placeholder="e.g., Figma, React, HubSpot, Cursor..."
											value={formData.tools}
											onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
											className="bg-secondary/50 border-border focus:border-amber"
										/>
									</div>

									{/* Submit */}
									<Button
										type="submit"
										size="lg"
										disabled={isSubmitting}
										className="w-full bg-amber hover:bg-amber-dark text-white dark:text-background font-semibold glow-amber"
									>
										{isSubmitting ? (
											<>
												<Zap className="mr-2 h-5 w-5 animate-pulse" />
												Sending...
											</>
										) : (
											<>
												Send application
												<ArrowRight className="ml-2 h-5 w-5" />
											</>
										)}
									</Button>

									{/* Privacy note */}
									<p className="text-xs text-muted-foreground text-center">
										By submitting, you agree to let us review your application and contact you about opportunities. We
										won&apos;t share your data with third parties.
									</p>
								</form>
							</CardContent>
						</Card>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
