/**
 * API Field Names for Lomavis API
 * These constants represent the exact field names expected by the API
 * Using constants ensures consistency and makes refactoring easier
 */

/**
 * Post-related API field names
 */
export const POST_FIELDS = {
	PROFILE_GROUP: 'profile_group',
	PROFILE_GROUP_UUID: 'profile_group_uuid',
	TEXT: 'text',
	POST_STATUS: 'post_status',
	PLATFORM_CONFIGURATION: 'platform_configuration',
	MEDIA: 'media',
	VIDEO_THUMBNAIL: 'video_thumbnail',
	PLANNED_PUBLICATION_DATETIME: 'planned_publication_datetime',
	LINKEDIN_DOCUMENT_TITLE: 'linkedin_document_title',
	CUSTOM_METADATA: 'custom_metadata',
	UUID: 'uuid',
} as const;

/**
 * Approval process API field names
 */
export const APPROVAL_FIELDS = {
	MULTIPLATFORM_SOCIAL_MEDIA_POST: 'multiplatform_social_media_post',
	APPROVAL_STEP_1_USERS: 'approval_step_1_users',
	APPROVAL_STEP_1_USERS_RULE: 'approval_step_1_users_rule',
	APPROVAL_STEP_2_USERS: 'approval_step_2_users',
	APPROVAL_STEP_2_USERS_RULE: 'approval_step_2_users_rule',
	STEP_MODE: 'step_mode',
} as const;

/**
 * Query parameter field names
 */
export const QUERY_FIELDS = {
	LIMIT: 'limit',
	CURSOR: 'cursor',
	OMIT_EMPTY: 'omitEmpty',
} as const;

/**
 * Credential name for authentication
 */
export const CREDENTIAL_NAME = 'lomavisApi';
