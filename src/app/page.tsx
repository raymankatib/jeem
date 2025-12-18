import {
	Navigation,
	HeroSection,
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
		<main className="relative">
			<Navigation />
			<HeroSection />
			<RolesSection />
			<HowItWorksSection />
			<BenefitsSection />
			<ProofSection />
			<FAQSection />
			<ApplicationForm />
			<Footer />
		</main>
	);
}
