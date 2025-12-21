import { Variants } from "framer-motion";

// Subtle, purposeful animations - 150-250ms with ease-out curves
// No bounce or elastic effects

export const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.4,
			ease: [0.25, 0.46, 0.45, 0.94] // ease-out
		}
	}
};

export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.08,
			delayChildren: 0.1
		}
	}
};

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: "easeOut"
		}
	}
};

export const slideInFromLeft: Variants = {
	hidden: { opacity: 0, x: -16 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.35,
			ease: [0.25, 0.46, 0.45, 0.94]
		}
	}
};

export const slideInFromRight: Variants = {
	hidden: { opacity: 0, x: 16 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.35,
			ease: [0.25, 0.46, 0.45, 0.94]
		}
	}
};

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.96 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.3,
			ease: [0.25, 0.46, 0.45, 0.94]
		}
	}
};

// Hover state for cards - subtle elevation
export const cardHover = {
	rest: {
		y: 0,
		transition: { duration: 0.2, ease: "easeOut" }
	},
	hover: {
		y: -2,
		transition: { duration: 0.2, ease: "easeOut" }
	}
};

// Subtle opacity change for interactive elements
export const subtleHover = {
	rest: { opacity: 1 },
	hover: {
		opacity: 0.8,
		transition: { duration: 0.15, ease: "easeOut" }
	}
};
