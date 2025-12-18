import { Variants } from "framer-motion";

export const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0 }
};

export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1
		}
	}
};

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1 }
};

export const slideInFromLeft: Variants = {
	hidden: { opacity: 0, x: -30 },
	visible: { opacity: 1, x: 0 }
};

export const slideInFromRight: Variants = {
	hidden: { opacity: 0, x: 30 },
	visible: { opacity: 1, x: 0 }
};

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: { opacity: 1, scale: 1 }
};

