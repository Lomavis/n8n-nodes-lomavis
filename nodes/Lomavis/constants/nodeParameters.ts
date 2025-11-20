/**
 * n8n Node Parameter Names
 * These constants represent internal n8n node parameter names
 * Used for consistency when calling this.getNodeParameter()
 */

/**
 * Post operation parameter names
 */
export const POST_PARAMS = {
	PROFILE_GROUP_UUID: 'profileGroupUuid',
	TEXT: 'text',
	POST_STATUS: 'postStatus',
	PLATFORM_CONFIGURATION: 'platformConfiguration',
	ADDITIONAL_FIELDS: 'additionalFields',
	PLANNED_PUBLICATION_DATETIME: 'plannedPublicationDatetime',
	VIDEO_THUMBNAIL_UUID: 'videoThumbnailUuid',
	CUSTOM_METADATA: 'customMetadata',
	LINKEDIN_DOCUMENT_TITLE: 'linkedinDocumentTitle',
	MEDIA_COLLECTION: 'mediaCollection',
} as const;

/**
 * Approval operation parameter names
 */
export const APPROVAL_PARAMS = {
	STEP_MODE: 'stepMode',
	APPROVAL_STEP_1_USERS: 'approvalStep1Users',
	APPROVAL_STEP_1_USERS_RULE: 'approvalStep1UsersRule',
	APPROVAL_STEP_2_USERS: 'approvalStep2Users',
	APPROVAL_STEP_2_USERS_RULE: 'approvalStep2UsersRule',
} as const;

/**
 * Common parameter names
 */
export const COMMON_PARAMS = {
	OPTIONS: 'options',
	LIMIT: 'limit',
	CURSOR: 'cursor',
	BINARY_PROPERTY_NAME: 'binaryPropertyName',
} as const;
