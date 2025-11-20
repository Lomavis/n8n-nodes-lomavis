/**
 * Lomavis API base URL and endpoint paths
 */

export const BASE_URL = 'https://app.lomavis.com/lomavis_publishing_api/v1';

/**
 * API endpoint paths (relative to BASE_URL)
 */
export const ENDPOINTS = {
	// Approval Process endpoints
	APPROVAL_PROCESSES: '/approvalprocesses/',

	// Media endpoints
	MEDIA: '/media/',
	MEDIA_BY_UUID: (uuid: string) => `/media/${uuid}/`,

	// Post endpoints
	POSTS: '/multiplatformsocialmediaposts/',
	POST_BY_UUID: (uuid: string) => `/multiplatformsocialmediaposts/${uuid}/`,

	// Profile Group endpoints
	PROFILE_GROUPS: '/profile_groups/',
	PROFILE_GROUP_BY_UUID: (uuid: string) => `/profile_groups/${uuid}/`,
} as const;

/**
 * Helper to build full URL from endpoint path
 */
export function buildUrl(endpoint: string): string {
	return `${BASE_URL}${endpoint}`;
}
