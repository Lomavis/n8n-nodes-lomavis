/**
 * Request Body Builder Helpers
 * These functions construct request bodies for Lomavis API calls
 * Centralizes business logic for building API payloads
 */

import type { IDataObject } from 'n8n-workflow';
import { POST_FIELDS, APPROVAL_FIELDS } from '../constants/apiFields';
import { PLATFORMS } from '../constants/platforms';
import { POST_STATUS } from '../constants/postStatuses';

/**
 * Builds platform configuration object from array of selected platforms
 * Converts platform array to boolean flags object expected by API
 * 
 * @param platforms - Array of selected platform identifiers
 * @returns Object with boolean flags for each platform
 * 
 * @example
 * buildPlatformConfiguration(['facebook', 'instagram'])
 * // Returns: { facebook: true, instagram: true, google: false, ... }
 */
export function buildPlatformConfiguration(platforms: string[]): IDataObject {
	return {
		[PLATFORMS.FACEBOOK]: platforms.includes(PLATFORMS.FACEBOOK),
		[PLATFORMS.INSTAGRAM]: platforms.includes(PLATFORMS.INSTAGRAM),
		[PLATFORMS.GOOGLE]: platforms.includes(PLATFORMS.GOOGLE),
		[PLATFORMS.TWITTER]: platforms.includes(PLATFORMS.TWITTER),
		[PLATFORMS.LINKEDIN_PERSONAL_ACCOUNT]: platforms.includes(PLATFORMS.LINKEDIN_PERSONAL_ACCOUNT),
		[PLATFORMS.LINKEDIN_BUSINESS_PAGE]: platforms.includes(PLATFORMS.LINKEDIN_BUSINESS_PAGE),
		[PLATFORMS.YOUTUBE]: platforms.includes(PLATFORMS.YOUTUBE),
		[PLATFORMS.TIKTOK_BUSINESS_PAGE]: platforms.includes(PLATFORMS.TIKTOK_BUSINESS_PAGE),
		[PLATFORMS.PINTEREST]: platforms.includes(PLATFORMS.PINTEREST),
	};
}

/**
 * Parameters for building a post request body
 */
export interface PostBodyParams {
	profileGroupUuid: string;
	text: string;
	postStatus: number;
	platforms: string[];
	mediaUuids?: string[];
	plannedPublicationDatetime?: string | null;
	videoThumbnailUuid?: string;
	linkedinDocumentTitle?: string;
	customMetadata?: string;
}

/**
 * Builds the request body for creating/updating a post
 * Handles all post fields including optional parameters
 * 
 * @param params - Post parameters
 * @returns Complete post body ready for API submission
 * 
 * Business Rules:
 * - If post_status is READY and no plannedPublicationDatetime, sets to null (immediate publish)
 * - If post_status is READY with plannedPublicationDatetime, uses it (scheduled publish)
 * - LinkedIn document title only included if LinkedIn platforms selected
 */
export function buildPostBody(params: PostBodyParams): IDataObject {
	const {
		profileGroupUuid,
		text,
		postStatus,
		platforms,
		mediaUuids = [],
		plannedPublicationDatetime,
		videoThumbnailUuid,
		linkedinDocumentTitle,
		customMetadata,
	} = params;

	const platformConfiguration = buildPlatformConfiguration(platforms);
	
	// Transform media UUIDs to API format
	const mediaArray = mediaUuids
		.filter(uuid => uuid && uuid.trim().length > 0)
		.map(uuid => ({ [POST_FIELDS.UUID]: uuid }));

	// Base post body
	const body: IDataObject = {
		[POST_FIELDS.PROFILE_GROUP]: profileGroupUuid,
		[POST_FIELDS.TEXT]: text,
		[POST_FIELDS.POST_STATUS]: postStatus,
		[POST_FIELDS.PLATFORM_CONFIGURATION]: platformConfiguration,
		[POST_FIELDS.MEDIA]: mediaArray,
	};

	// Handle planned publication datetime based on post status
	if (postStatus === POST_STATUS.READY) {
		// For READY status: use provided datetime or null for immediate publish
		body[POST_FIELDS.PLANNED_PUBLICATION_DATETIME] = plannedPublicationDatetime || null;
	} else if (plannedPublicationDatetime) {
		// For other statuses (DRAFT): include if provided
		body[POST_FIELDS.PLANNED_PUBLICATION_DATETIME] = plannedPublicationDatetime;
	}

	// Add optional fields if provided
	if (videoThumbnailUuid) {
		body[POST_FIELDS.VIDEO_THUMBNAIL] = { [POST_FIELDS.UUID]: videoThumbnailUuid };
	}

	if (customMetadata) {
		body[POST_FIELDS.CUSTOM_METADATA] = customMetadata;
	}

	// Only add LinkedIn document title if LinkedIn platforms are selected
	const hasLinkedIn = platforms.includes(PLATFORMS.LINKEDIN_PERSONAL_ACCOUNT) || 
	                     platforms.includes(PLATFORMS.LINKEDIN_BUSINESS_PAGE);
	if (linkedinDocumentTitle && hasLinkedIn) {
		body[POST_FIELDS.LINKEDIN_DOCUMENT_TITLE] = linkedinDocumentTitle;
	}

	return body;
}

/**
 * User object with UUID for approval process
 */
export interface ApprovalUser {
	uuid: string;
}

/**
 * Parameters for building an approval process request body
 */
export interface ApprovalBodyParams {
	postUuid: string;
	step1Users: ApprovalUser[];
	step1Rule: number;
	stepMode: number;
	step2Users?: ApprovalUser[];
	step2Rule?: number;
}

/**
 * Builds the request body for creating an approval process
 * Handles both single-step and multi-step approval workflows
 * 
 * @param params - Approval parameters
 * @returns Complete approval body ready for API submission
 */
export function buildApprovalBody(params: ApprovalBodyParams): IDataObject {
	const {
		postUuid,
		step1Users,
		step1Rule,
		stepMode,
		step2Users = [],
		step2Rule,
	} = params;

	// Transform users to API format
	const step1UserObjects = step1Users
		.filter(user => user.uuid && user.uuid.trim().length > 0)
		.map(user => ({ [POST_FIELDS.UUID]: user.uuid }));

	const body: IDataObject = {
		[APPROVAL_FIELDS.MULTIPLATFORM_SOCIAL_MEDIA_POST]: postUuid,
		[APPROVAL_FIELDS.APPROVAL_STEP_1_USERS]: step1UserObjects,
		[APPROVAL_FIELDS.APPROVAL_STEP_1_USERS_RULE]: step1Rule,
		[APPROVAL_FIELDS.STEP_MODE]: stepMode,
	};

	// Add step 2 parameters if provided and valid
	if (step2Users.length > 0) {
		const step2UserObjects = step2Users
			.filter(user => user.uuid && user.uuid.trim().length > 0)
			.map(user => ({ [POST_FIELDS.UUID]: user.uuid }));
		
		if (step2UserObjects.length > 0) {
			body[APPROVAL_FIELDS.APPROVAL_STEP_2_USERS] = step2UserObjects;
			if (step2Rule !== undefined) {
				body[APPROVAL_FIELDS.APPROVAL_STEP_2_USERS_RULE] = step2Rule;
			}
		}
	}

	return body;
}

/**
 * Extracts media UUIDs from n8n media collection parameter
 * Filters out empty/invalid UUIDs
 * 
 * @param mediaCollection - n8n fixedCollection parameter
 * @returns Array of valid media UUIDs
 */
export function extractMediaUuids(mediaCollection: IDataObject): string[] {
	const mediaItems = (mediaCollection.media as IDataObject[]) || [];
	return mediaItems
		.map(item => item.uuid as string)
		.filter(uuid => uuid && uuid.trim().length > 0);
}

/**
 * Extracts user objects from n8n users collection parameter
 * Filters out invalid entries
 * 
 * @param usersCollection - n8n fixedCollection parameter  
 * @returns Array of valid user objects with UUIDs
 */
export function extractApprovalUsers(usersCollection: IDataObject): ApprovalUser[] {
	const users = (usersCollection.users as IDataObject[]) || [];
	return users
		.filter(user => user[POST_FIELDS.UUID] && (user[POST_FIELDS.UUID] as string).trim().length > 0)
		.map(user => ({ [POST_FIELDS.UUID]: user[POST_FIELDS.UUID] as string }));
}

/**
 * Builds platform configuration object for LEGACY API format
 * Converts array of platform strings to boolean flags object
 * Used by older endpoints that expect platform_configuration as an object
 * 
 * @param platforms - Array of platform identifiers
 * @returns Object with platform names as keys and boolean values
 * 
 * @example
 * ```typescript
 * buildPlatformConfigurationLegacy(['facebook', 'instagram'])
 * // Returns: { facebook: true, instagram: true, google: false, ... }
 * ```
 */
export function buildPlatformConfigurationLegacy(platforms: string[]): IDataObject {
	return {
		[PLATFORMS.FACEBOOK]: platforms.includes(PLATFORMS.FACEBOOK),
		[PLATFORMS.INSTAGRAM]: platforms.includes(PLATFORMS.INSTAGRAM),
		[PLATFORMS.GOOGLE]: platforms.includes(PLATFORMS.GOOGLE),
		[PLATFORMS.TWITTER]: platforms.includes(PLATFORMS.TWITTER),
		[PLATFORMS.LINKEDIN_PERSONAL_ACCOUNT]: platforms.includes(PLATFORMS.LINKEDIN_PERSONAL_ACCOUNT),
		[PLATFORMS.LINKEDIN_BUSINESS_PAGE]: platforms.includes(PLATFORMS.LINKEDIN_BUSINESS_PAGE),
		[PLATFORMS.YOUTUBE]: platforms.includes(PLATFORMS.YOUTUBE),
		[PLATFORMS.TIKTOK_BUSINESS_PAGE]: platforms.includes(PLATFORMS.TIKTOK_BUSINESS_PAGE),
		[PLATFORMS.PINTEREST]: platforms.includes(PLATFORMS.PINTEREST),
	};
}

/**
 * Extracts media UUIDs from n8n media collection for LEGACY API format
 * Returns array of objects with uuid property (older API format)
 * 
 * @param mediaCollection - n8n fixedCollection parameter
 * @returns Array of media UUID objects, filtering out empty values
 */
export function extractMediaUuidsLegacy(mediaCollection: IDataObject): Array<{ uuid: string }> {
	const mediaItems = (mediaCollection.media as IDataObject[]) || [];
	return mediaItems
		.filter(item => item.uuid && (item.uuid as string).trim().length > 0)
		.map(item => ({ uuid: item.uuid as string }));
}
