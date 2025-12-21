"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
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
		<section id="apply" className="py-32 relative bg-foreground text-background" ref={ref}>
			{/* Subtle noise texture */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
				}}
			/>

			<div className="container-narrow relative">
				<motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
					{/* Two-column layout */}
					<div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
						{/* Left Column - Header */}
						<motion.div variants={fadeInUp} className="lg:col-span-5">
							<p className="text-sm text-background/60 uppercase tracking-wider mb-3">Apply Now</p>
							<h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">Ready to join?</h2>
							<p className="text-background/70 text-lg leading-relaxed mb-8">
								Show us what you&apos;ve shipped. We review every application personally.
							</p>

							{/* Quick stats or trust signals */}
							<div className="space-y-4 text-sm text-background/60">
								<div className="flex items-center gap-3">
									<div className="w-1.5 h-1.5 rounded-full bg-background/40" />
									<span>We respond to every application</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-1.5 h-1.5 rounded-full bg-background/40" />
									<span>Typical response time: 2-3 days</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-1.5 h-1.5 rounded-full bg-background/40" />
									<span>No fee to join the network</span>
								</div>
							</div>
						</motion.div>

						{/* Right Column - Form */}
						<motion.div variants={fadeInUp} className="lg:col-span-7">
							<form onSubmit={handleSubmit} className="space-y-5">
								{/* Name & Email - Two columns */}
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label htmlFor="name" className="text-sm text-background/70">
											Full name <span className="text-background/40">*</span>
										</label>
										<Input
											id="name"
											type="text"
											placeholder="Your full name"
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
										/>
									</div>

									<div className="space-y-2">
										<label htmlFor="email" className="text-sm text-background/70">
											Email <span className="text-background/40">*</span>
										</label>
										<Input
											id="email"
											type="email"
											placeholder="you@example.com"
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
										/>
									</div>
								</div>

								{/* Role */}
								<div className="space-y-2">
									<label htmlFor="role" className="text-sm text-background/70">
										Role <span className="text-background/40">*</span>
									</label>
									<Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
										<SelectTrigger className="bg-background/5 border-background/10 text-background focus:border-background/30 h-11 [&>span]:text-background/70">
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
									<label htmlFor="portfolio" className="text-sm text-background/70">
										Portfolio / LinkedIn / GitHub <span className="text-background/40">*</span>
									</label>
									<Input
										id="portfolio"
										type="url"
										placeholder="https://..."
										value={formData.portfolio}
										onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
										className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
									/>
								</div>

								{/* What you've shipped */}
								<div className="space-y-2">
									<label htmlFor="shipped" className="text-sm text-background/70">
										Tell us what you&apos;ve shipped recently <span className="text-background/40">*</span>
									</label>
									<Textarea
										id="shipped"
										placeholder="Share a recent project, feature, or piece of work you're proud of. Be specific about your role and the outcome."
										rows={4}
										value={formData.shipped}
										onChange={(e) => setFormData({ ...formData, shipped: e.target.value })}
										className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 resize-none"
									/>
								</div>

								{/* Tools (optional) */}
								<div className="space-y-2">
									<label htmlFor="tools" className="text-sm text-background/70">
										Your strongest tools <span className="text-background/40">(optional)</span>
									</label>
									<Input
										id="tools"
										type="text"
										placeholder="e.g., Figma, React, HubSpot, Cursor..."
										value={formData.tools}
										onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
										className="bg-background/5 border-background/10 text-background placeholder:text-background/30 focus:border-background/30 h-11"
									/>
								</div>

								{/* Submit */}
								<div className="pt-4">
									<Button
										type="submit"
										size="lg"
										disabled={isSubmitting}
										className="w-full sm:w-auto bg-background hover:bg-background/90 text-foreground font-medium h-12 px-10 transition-opacity duration-200"
									>
										{isSubmitting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Sending...
											</>
										) : (
											<>
												Send application
												<ArrowRight className="ml-2 h-4 w-4" />
											</>
										)}
									</Button>
								</div>

								{/* Privacy note */}
								<p className="text-xs text-background/40 pt-2">
									By submitting, you agree to let us review your application and contact you about opportunities. We
									won&apos;t share your data with third parties.
								</p>
							</form>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
