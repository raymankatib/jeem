import {
	Code2,
	TrendingUp,
	Palette,
	Briefcase,
	Globe,
	DollarSign,
	Users,
	Award,
	Target,
	MessageSquare,
	Clock,
	Rocket,
	Shield,
	GraduationCap,
	LucideIcon
} from "lucide-react";

export interface TrustPill {
	icon: LucideIcon;
	text: string;
}

export interface Role {
	title: string;
	whatYouDo: string[];
	whatGoodLooksLike: string[];
	tools: string[];
}

export interface RoleCategory {
	id: string;
	label: string;
	icon: LucideIcon;
	roles: Role[];
}

export interface Step {
	number: string;
	title: string;
	description: string;
	icon: LucideIcon;
}

export interface Benefit {
	icon: LucideIcon;
	title: string;
	description: string;
}

export interface Value {
	title: string;
	description: string;
}

export interface Testimonial {
	quote: string;
	role: string;
}

export interface FAQItem {
	question: string;
	answer: string;
}

export const CONFIG = {
	nav: {
		links: ["Roles", "How it works", "Benefits", "Proof", "FAQ"],
		cta: "Apply to Jeem"
	},
	hero: {
		headline: "Join the network where",
		headlineAccent: "builders ship",
		subheadline:
			"Get matched with real work from serious teams. Grow your craft, earn in USD, and be part of a community that values quality over quantity.",
		primaryCta: "Apply to Jeem",
		secondaryCta: "See roles",
		trustPills: [
			{ icon: Globe, text: "Remote-friendly" },
			{ icon: DollarSign, text: "Paid in USD" },
			{ icon: Users, text: "Serious teams" },
			{ icon: Award, text: "Portfolio-first" }
		] as TrustPill[]
	},
	roles: {
		categories: [
			{
				id: "engineering",
				label: "Engineering",
				icon: Code2,
				roles: [
					{
						title: "Vibe Coding Engineer",
						whatYouDo: [
							"Build products through conversational AI-assisted development",
							"Translate ideas into working code rapidly using modern AI tools",
							"Iterate on features with speed while maintaining quality"
						],
						whatGoodLooksLike: [
							"You've shipped products using Cursor, Copilot, or similar tools",
							"You can context-switch fast and communicate decisions clearly"
						],
						tools: ["Cursor", "Claude", "GPT-4", "Vercel", "React"]
					},
					{
						title: "Software Developer",
						whatYouDo: [
							"Build and maintain production-grade applications",
							"Write clean, tested, and documented code",
							"Collaborate with designers and product on features"
						],
						whatGoodLooksLike: [
							"You have a portfolio of shipped products or open-source work",
							"You can own a feature from spec to deploy"
						],
						tools: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"]
					},
					{
						title: "Content Creator as Engineer",
						whatYouDo: [
							"Create technical content that educates and engages",
							"Build demo projects and code tutorials",
							"Bridge the gap between engineering and audience"
						],
						whatGoodLooksLike: [
							"Your content has real engagement (views, shares, comments)",
							"You can explain complex topics simply"
						],
						tools: ["MDX", "YouTube", "Twitter/X", "Notion", "Figma"]
					}
				]
			},
			{
				id: "growth",
				label: "Growth",
				icon: TrendingUp,
				roles: [
					{
						title: "Marketer",
						whatYouDo: [
							"Drive awareness and acquisition for products",
							"Plan and execute campaigns across channels",
							"Analyze performance and optimize spend"
						],
						whatGoodLooksLike: [
							"You've run campaigns that moved real metrics",
							"You can think strategically and execute tactically"
						],
						tools: ["Google Ads", "Meta Ads", "Mixpanel", "HubSpot", "Notion"]
					},
					{
						title: "SEO & AEO Specialist",
						whatYouDo: [
							"Optimize content for search and AI answer engines",
							"Conduct keyword research and competitive analysis",
							"Build and execute content strategies that rank"
						],
						whatGoodLooksLike: [
							"You've grown organic traffic measurably",
							"You understand modern search beyond just keywords"
						],
						tools: ["Ahrefs", "SEMrush", "Screaming Frog", "ChatGPT", "Perplexity"]
					},
					{
						title: "Social Media Manager",
						whatYouDo: [
							"Manage brand presence across social platforms",
							"Create engaging content calendars and copy",
							"Build community and drive engagement"
						],
						whatGoodLooksLike: [
							"You've grown accounts with real engagement, not vanity metrics",
							"You understand platform nuances and timing"
						],
						tools: ["Buffer", "Hootsuite", "Canva", "CapCut", "Twitter/X"]
					}
				]
			},
			{
				id: "revenue",
				label: "Revenue Ops",
				icon: Target,
				roles: [
					{
						title: "Lead Generator",
						whatYouDo: [
							"Research and identify high-quality prospects",
							"Build targeted lead lists using multiple sources",
							"Qualify leads before they hit sales"
						],
						whatGoodLooksLike: [
							"You've built lead lists that converted to real revenue",
							"You know how to find decision-makers efficiently"
						],
						tools: ["Apollo.io", "LinkedIn Sales Nav", "Clay", "Clearbit", "Hunter.io"]
					},
					{
						title: "Sales Pipelines Builder",
						whatYouDo: [
							"Design and implement sales processes in CRMs",
							"Set up automations and reporting dashboards",
							"Optimize pipeline stages for conversion"
						],
						whatGoodLooksLike: [
							"You've built pipelines that sales teams actually use",
							"You understand both the tech and the sales motion"
						],
						tools: ["HubSpot", "Salesforce", "Pipedrive", "Zapier", "Close"]
					},
					{
						title: "Lead Qualifier",
						whatYouDo: [
							"Review and score inbound leads quickly",
							"Conduct discovery calls to assess fit",
							"Route qualified leads to the right sales rep"
						],
						whatGoodLooksLike: [
							"You can assess fit in minutes, not hours",
							"You communicate qualification criteria clearly"
						],
						tools: ["HubSpot", "Calendly", "Zoom", "Slack", "Notion"]
					}
				]
			},
			{
				id: "creative",
				label: "Creative",
				icon: Palette,
				roles: [
					{
						title: "Designer",
						whatYouDo: [
							"Design user interfaces that are beautiful and functional",
							"Create brand assets and marketing materials",
							"Collaborate with engineers on implementation"
						],
						whatGoodLooksLike: ["Your portfolio shows range and taste", "You can ship, not just ideate"],
						tools: ["Figma", "Framer", "Photoshop", "Illustrator", "Webflow"]
					},
					{
						title: "AI Video Creator",
						whatYouDo: [
							"Produce video content using AI-powered tools",
							"Create engaging shorts, ads, and explainers",
							"Iterate quickly on concepts and styles"
						],
						whatGoodLooksLike: [
							"You've produced videos that got real traction",
							"You can handle the full pipeline: script to edit"
						],
						tools: ["Runway", "Pika", "HeyGen", "ElevenLabs", "CapCut"]
					}
				]
			},
			{
				id: "operations",
				label: "Operations",
				icon: Briefcase,
				roles: [
					{
						title: "Virtual Assistant",
						whatYouDo: [
							"Manage calendars, emails, and communications",
							"Handle research tasks and documentation",
							"Keep projects organized and on track"
						],
						whatGoodLooksLike: [
							"You anticipate needs before being asked",
							"You're reliable, responsive, and detail-oriented"
						],
						tools: ["Notion", "Slack", "Gmail", "Calendly", "Asana"]
					}
				]
			}
		] as RoleCategory[]
	},
	howItWorks: {
		steps: [
			{
				number: "01",
				title: "Apply",
				description:
					"Submit your application with your portfolio or examples of work. We want to see what you've shipped, not just your resume.",
				icon: Rocket
			},
			{
				number: "02",
				title: "Get Screened",
				description:
					"We review every application personally. If there's a fit, we'll have a quick call to understand your strengths and preferences.",
				icon: Shield
			},
			{
				number: "03",
				title: "Get Trained",
				description:
					"Level up with tailored training to match enterprise standards. We prepare you for the expectations of top-tier companies.",
				icon: GraduationCap
			},
			{
				number: "04",
				title: "Match to Work",
				description:
					"When a project matches your skills, we'll reach out. You decide if it's right for you. No pressure, just opportunities.",
				icon: Target
			},
			{
				number: "05",
				title: "Deliver & Grow",
				description:
					"Ship great work, get feedback, build reputation. The better you perform, the more opportunities come your way.",
				icon: TrendingUp
			}
		] as Step[]
	},
	benefits: [
		{
			icon: Award,
			title: "Quality Work, Not Gigs",
			description:
				"We curate projects worth your time. Real products, real teams, real impact. No bidding against hundreds of strangers."
		},
		{
			icon: Target,
			title: "Clear Scope & Expectations",
			description:
				"Every project comes with defined deliverables, timelines, and communication norms. No scope creep nightmares."
		},
		{
			icon: MessageSquare,
			title: "Growth Feedback Loop",
			description: "Get actionable feedback after every engagement. Know where you shine and where you can level up."
		},
		{
			icon: Users,
			title: "Community + Learning",
			description:
				"Connect with other top talent. Share knowledge, get advice, and grow together in a network that has your back."
		},
		{
			icon: Clock,
			title: "Flexible, But Professional",
			description: "Work on your schedule, but meet your commitments. We value async work and respect time zones."
		},
		{
			icon: DollarSign,
			title: "Fair, Transparent Pay",
			description: "Paid in USD. Rates discussed upfront. No surprises, no chasing invoices."
		}
	] as Benefit[],
	proof: {
		values: [
			{ title: "Quality", description: "Ship work you'd put your name on." },
			{ title: "Speed", description: "Momentum matters. Move with urgency." },
			{ title: "Communication", description: "Proactive updates. No surprises." },
			{ title: "Ownership", description: "Own outcomes, not just tasks." }
		] as Value[],
		testimonials: [
			{
				quote:
					"Finally found a network that respects my time and matches me with projects worth doing. The teams are real, the work is interesting.",
				role: "Senior Developer, matched via Jeem"
			},
			{
				quote:
					"The screening process was tough but fair. It filters out noise. Now I get quality opportunities without the usual freelance chaos.",
				role: "Product Designer, matched via Jeem"
			},
			{
				quote:
					"I was skeptical about another 'talent network' but Jeem actually delivers. Clear communication, good projects, respectful clients.",
				role: "Growth Marketer, matched via Jeem"
			}
		] as Testimonial[],
		standards: [
			"We verify every portfolio",
			"We personally review every application",
			"We only work with teams we'd join ourselves",
			"We give honest feedback, always"
		]
	},
	faq: [
		{
			question: "Who can apply?",
			answer:
				"Anyone with demonstrable skills in our listed roles. We care about what you've shipped, not where you went to school or where you live. Portfolio and examples matter most."
		},
		{
			question: "Do I need to be in a specific location?",
			answer:
				"No. We're remote-friendly and work with talent globally. However, some projects may have timezone preferences (usually requiring 4+ hours overlap with US/EU times)."
		},
		{
			question: "What's the English requirement?",
			answer:
				"You need to communicate clearly in written English. Most client interactions are async, so strong writing matters. If you can read and respond to this page comfortably, you're likely fine."
		},
		{
			question: "How does payment work?",
			answer:
				"You're paid in USD, typically via bank transfer or Wise. Rates are agreed upfront before any project starts. We don't take cuts from your pay — our fee is on the client side."
		},
		{
			question: "What timezones do you work with?",
			answer:
				"All of them. That said, most of our clients are in US and EU timezones. We'll share timezone expectations for each opportunity so you can decide if it fits your schedule."
		},
		{
			question: "What does the screening process look like?",
			answer:
				"We review your application and portfolio. If there's a potential fit, we'll schedule a 20-30 minute call to learn more about you. We're looking for proof of quality work and good communication."
		},
		{
			question: "How long does matching take?",
			answer:
				"It varies. Some people get matched within days, others within weeks. It depends on your skills, availability, and what projects we have coming in. We won't spam you with irrelevant opportunities."
		},
		{
			question: "Can I apply for multiple roles?",
			answer:
				"Yes, but pick your strongest. We'd rather see you excel in one area than be mediocre across many. You can mention secondary skills in your application."
		},
		{
			question: "What if I'm currently employed full-time?",
			answer:
				"That's fine. Many of our talent work part-time or on weekends. Just be clear about your availability so we can match you with appropriate projects."
		},
		{
			question: "Is there a fee to join?",
			answer:
				"No. It's free to apply and be part of the network. We make money when we place you with clients, and that fee comes from the client, not you."
		}
	] as FAQItem[],
	roles_list: [
		"Vibe Coding Engineer",
		"Software Developer",
		"Content Creator as Engineer",
		"Marketer",
		"SEO & AEO Specialist",
		"Social Media Manager",
		"Lead Generator",
		"Sales Pipelines Builder",
		"Lead Qualifier",
		"Designer",
		"AI Video Creator",
		"Virtual Assistant"
	]
};

