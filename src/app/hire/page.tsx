import {
	HireTopBanner,
	HireNavigation,
	HireHeroSection,
	WhyJeemSection,
	TalentPoolSection,
	HireHowItWorksSection,
	HireProofSection,
	HireFAQSection,
	CompanyApplicationForm,
	HireFooter
} from "@/components/hire";

export default function HireFromJeemPage() {
	return (
		<main className="relative">
			<HireTopBanner />
			<HireNavigation />
			<HireHeroSection />
			<WhyJeemSection />
			<TalentPoolSection />
			<HireHowItWorksSection />
			<HireProofSection />
			<HireFAQSection />
			<CompanyApplicationForm />
			<HireFooter />
		</main>
	);
}
