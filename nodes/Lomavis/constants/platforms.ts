/**
 * Social Media Platform Constants for Lomavis API
 * These constants define all supported social media platforms
 */

/**
 * Platform identifier strings used in API requests
 */
export const PLATFORMS = {
	FACEBOOK: 'facebook',
	GOOGLE: 'google',
	INSTAGRAM: 'instagram',
	LINKEDIN_BUSINESS_PAGE: 'linkedin_business_page',
	LINKEDIN_PERSONAL_ACCOUNT: 'linkedin_personal_account',
	PINTEREST: 'pinterest',
	TIKTOK_BUSINESS_PAGE: 'tiktok_business_page',
	TWITTER: 'twitter',
	YOUTUBE: 'youtube',
} as const;

/**
 * Platform display names for UI
 */
export const PLATFORM_NAMES = {
	[PLATFORMS.FACEBOOK]: 'Facebook',
	[PLATFORMS.GOOGLE]: 'Google',
	[PLATFORMS.INSTAGRAM]: 'Instagram',
	[PLATFORMS.LINKEDIN_BUSINESS_PAGE]: 'LinkedIn Business Page',
	[PLATFORMS.LINKEDIN_PERSONAL_ACCOUNT]: 'LinkedIn Personal Account',
	[PLATFORMS.PINTEREST]: 'Pinterest',
	[PLATFORMS.TIKTOK_BUSINESS_PAGE]: 'TikTok Business Page',
	[PLATFORMS.TWITTER]: 'Twitter',
	[PLATFORMS.YOUTUBE]: 'YouTube',
} as const;

/**
 * Array of all platform keys for iteration
 */
export const PLATFORM_KEYS = Object.values(PLATFORMS);

/**
 * Platform options for n8n multiOptions fields
 * Provides consistent platform selection UI across all operations
 */
export const PLATFORM_OPTIONS = [
	{ name: PLATFORM_NAMES[PLATFORMS.FACEBOOK], value: PLATFORMS.FACEBOOK },
	{ name: PLATFORM_NAMES[PLATFORMS.GOOGLE], value: PLATFORMS.GOOGLE },
	{ name: PLATFORM_NAMES[PLATFORMS.INSTAGRAM], value: PLATFORMS.INSTAGRAM },
	{ name: PLATFORM_NAMES[PLATFORMS.LINKEDIN_BUSINESS_PAGE], value: PLATFORMS.LINKEDIN_BUSINESS_PAGE },
	{ name: PLATFORM_NAMES[PLATFORMS.LINKEDIN_PERSONAL_ACCOUNT], value: PLATFORMS.LINKEDIN_PERSONAL_ACCOUNT },
	{ name: PLATFORM_NAMES[PLATFORMS.PINTEREST], value: PLATFORMS.PINTEREST },
	{ name: PLATFORM_NAMES[PLATFORMS.TIKTOK_BUSINESS_PAGE], value: PLATFORMS.TIKTOK_BUSINESS_PAGE },
	{ name: PLATFORM_NAMES[PLATFORMS.TWITTER], value: PLATFORMS.TWITTER },
	{ name: PLATFORM_NAMES[PLATFORMS.YOUTUBE], value: PLATFORMS.YOUTUBE },
] as const;

/**
 * Type helper for platform values
 */
export type PlatformValue = typeof PLATFORMS[keyof typeof PLATFORMS];
