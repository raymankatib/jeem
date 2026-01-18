import {
	TopBanner,
	Navigation,
	HeroSection,
	PartnerLogos,
	RolesSection,
	HowItWorksSection,
	BenefitsSection,
	ProofSection,
	FAQSection,
	ApplicationForm,
	Footer
} from "@/components/landing";

export default function JeemLandingPage() {
	return (
		<div className="min-h-screen bg-white dark:bg-black pt-20">
			{/* Navigation - above the card, full width, no background */}
			<Navigation />
			
			{/* Hero Card - rounded gray gradient, only wraps hero section */}
			<div className="px-4 sm:px-6 lg:px-8 ">
				<div className="hero-card max-w-7xl mx-auto">
					<HeroSection />
				</div>
			</div>
			
			{/* Everything below is on white background directly */}
			{/* <PartnerLogos /> */}
			<RolesSection />
			<HowItWorksSection />
			<BenefitsSection />
			<ProofSection />
			<FAQSection />
			<ApplicationForm />
			<Footer />
			
			<TopBanner />
		</div>
	);
}
