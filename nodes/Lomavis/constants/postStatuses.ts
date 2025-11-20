/**
 * Post status constants for Lomavis API
 * These represent the different states a post can be in
 */
export const POST_STATUS = {
	PROPOSED_BY_EXTERNAL_USER: 1,
	DRAFT: 2,
	WAITING_FOR_APPROVAL: 3,
	READY: 4,
} as const;

/**
 * Type helper for post status values
 */
export type PostStatus = typeof POST_STATUS[keyof typeof POST_STATUS];

/**
 * String representations of post statuses for API queries
 * Used in multiOptions where values need to be strings
 */
export const POST_STATUS_STRING = {
	PROPOSED_BY_EXTERNAL_USER: '1',
	DRAFT: '2',
	WAITING_FOR_APPROVAL: '3',
	READY: '4',
} as const;

/**
 * Approval step mode constants
 * Determines whether approval is single-step or multi-step
 */
export const APPROVAL_STEP_MODE = {
	SINGLE_STEP: 1,
	MULTI_STEP: 2,
} as const;

/**
 * Approval rules constants
 * Defines how many approvers need to approve
 */
export const APPROVAL_RULE = {
	ALL_USERS_MUST_APPROVE: 1,
	ANY_USER_CAN_APPROVE: 2,
} as const;
