/**
 * UTM parameter handling with cookie persistence
 *
 * Logic:
 * - If UTM params are in URL, use them and store in cookies
 * - If UTM params are NOT in URL but exist in cookies, use cookie values
 * - This allows tracking users who visit with UTM source but register later
 */

export interface UTMParams {
	utm_source: string;
	utm_medium: string;
	utm_campaign: string;
	utm_term: string;
	utm_content: string;
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string {
	if (typeof document === 'undefined') return '';

	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop()?.split(';').shift() || '';
	}
	return '';
}

/**
 * Set a cookie with the given name and value
 */
function setCookie(name: string, value: string): void {
	if (typeof document === 'undefined') return;

	// Set cookie with 30-day expiry, SameSite=Lax for security
	document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

/**
 * Get UTM parameters from URL and cookies
 * URL params take precedence over cookies
 * If URL params exist, they are stored in cookies for future visits
 */
export function getUTMParams(): UTMParams {
	if (typeof window === 'undefined') {
		return {
			utm_source: '',
			utm_medium: '',
			utm_campaign: '',
			utm_term: '',
			utm_content: ''
		};
	}

	const urlParams = new URLSearchParams(window.location.search);
	const result: UTMParams = {
		utm_source: '',
		utm_medium: '',
		utm_campaign: '',
		utm_term: '',
		utm_content: ''
	};

	for (const key of UTM_KEYS) {
		const urlValue = urlParams.get(key);

		if (urlValue) {
			// URL param exists - use it and store in cookie
			result[key] = urlValue;
			setCookie(key, urlValue);
		} else {
			// No URL param - fall back to cookie value
			result[key] = decodeURIComponent(getCookie(key));
		}
	}

	return result;
}
