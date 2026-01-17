"use client";

import { motion } from "framer-motion";

export function PartnerLogos() {
	// Placeholder partner logos per PRD
	const partners = [
		{ name: "TechFlow", id: 1 },
		{ name: "ScaleUp", id: 2 },
		{ name: "BuildFast", id: 3 },
		{ name: "DevStudio", id: 4 },
		{ name: "CloudBase", id: 5 }
	];

	return (
		<section className="py-16 bg-white dark:bg-black">
			<div className="container-narrow">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="flex flex-wrap items-center justify-center lg:justify-between gap-8 lg:gap-12"
				>
					{partners.map((partner, index) => (
						<motion.div
							key={partner.id}
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1, duration: 0.4 }}
							className="flex items-center justify-center"
						>
							{/* Logo Ipsum placeholder per PRD */}
							<div className="flex items-center gap-2 opacity-60 hover:opacity-80 transition-opacity">
								<div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
									<span className="text-xs font-bold text-muted-foreground">
										{partner.name.charAt(0)}
									</span>
								</div>
								<span className="text-sm font-medium text-muted-foreground tracking-tight">
									{partner.name}
								</span>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

