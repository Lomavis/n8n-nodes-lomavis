import type {
	IExecuteFunctions,
	IDataObject,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { buildUrl, ENDPOINTS } from '../../constants/endpoints';
import { POST_STATUS, APPROVAL_STEP_MODE, APPROVAL_RULE } from '../../constants/postStatuses';
import { POST_FIELDS, APPROVAL_FIELDS, CREDENTIAL_NAME } from '../../constants/apiFields';
import { POST_PARAMS, APPROVAL_PARAMS } from '../../constants/nodeParameters';
import { PLATFORM_OPTIONS, PLATFORMS } from '../../constants/platforms';
import { buildPlatformConfigurationLegacy, extractMediaUuidsLegacy, extractApprovalUsers, type ApprovalUser } from '../../helpers/requestBuilders';

/**
 * Creates a draft post (status=2) and immediately sends it for approval
 * This is a 2-step process:
 * 1. Create the draft post with platform configuration and media
 * 2. Create an approval process for the created post
 */
export async function executePostCreateDraftAndSendApproval(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];

	// Step 1: Validate approval parameters FIRST (before creating any posts)
		const stepMode = this.getNodeParameter(APPROVAL_PARAMS.STEP_MODE, i) as number;
		const step1UsersCollection = this.getNodeParameter(APPROVAL_PARAMS.APPROVAL_STEP_1_USERS, i, {}) as IDataObject;
		const step1Rule = this.getNodeParameter(APPROVAL_PARAMS.APPROVAL_STEP_1_USERS_RULE, i) as number;

		// Process step 1 users using helper
		const step1UserObjects = extractApprovalUsers(step1UsersCollection);

		// Validate that at least one user is provided
		if (step1UserObjects.length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one Step 1 Approver is required',
				{
					message: 'Validation failed: Step 1 Approvers cannot be empty',
					description: 'Please add at least one user UUID in the Step 1 Approvers field.',
					itemIndex: i,
				},
			);
		}

	// Fetch step 2 parameters if multi-step mode (they are in additionalFields)
	let step2UserObjects: ApprovalUser[] = [];
	let step2Rule: number = APPROVAL_RULE.ALL_USERS_MUST_APPROVE;
	
	if (stepMode === APPROVAL_STEP_MODE.MULTI_STEP) {
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const step2UsersCollection = additionalFields[APPROVAL_PARAMS.APPROVAL_STEP_2_USERS] as IDataObject | undefined;
		step2Rule = (additionalFields[APPROVAL_PARAMS.APPROVAL_STEP_2_USERS_RULE] as number) || APPROVAL_RULE.ALL_USERS_MUST_APPROVE;
		
		if (step2UsersCollection) {
			step2UserObjects = extractApprovalUsers(step2UsersCollection);
		}
		
		// Validate that at least one Step 2 user is provided for multi-step mode
		if (step2UserObjects.length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one Step 2 Approver is required for multi-step approval',
				{
					message: 'Validation failed: Step 2 Approvers cannot be empty in multi-step mode',
					description: 'Please add at least one user UUID in the Step 2 Approvers field when using multi-step approval mode.',
					itemIndex: i,
				},
			);
		}
	}		// Step 2: Gather post parameters
		const postParams = {
			profileGroupUuid: this.getNodeParameter(POST_PARAMS.PROFILE_GROUP_UUID, i) as string,
			text: this.getNodeParameter(POST_PARAMS.TEXT, i) as string,
			platforms: this.getNodeParameter(POST_PARAMS.PLATFORM_CONFIGURATION, i) as string[],
			plannedPublicationDatetime: this.getNodeParameter(POST_PARAMS.PLANNED_PUBLICATION_DATETIME, i, '') as string,
			videoThumbnailUuid: this.getNodeParameter(POST_PARAMS.VIDEO_THUMBNAIL_UUID, i, '') as string,
			customMetadata: this.getNodeParameter(POST_PARAMS.CUSTOM_METADATA, i, '') as string,
			linkedinDocumentTitle: this.getNodeParameter(POST_PARAMS.LINKEDIN_DOCUMENT_TITLE, i, '') as string,
			mediaCollection: this.getNodeParameter(POST_PARAMS.MEDIA_COLLECTION, i, {}) as IDataObject,
		};
		// Process media array using helper
		const mediaArray = extractMediaUuidsLegacy(postParams.mediaCollection);

		// Build platform configuration using helper (convert array to boolean flags)
		const platformConfiguration = buildPlatformConfigurationLegacy(postParams.platforms);

		// Build post body
		const postBody: IDataObject = {
			[POST_FIELDS.TEXT]: postParams.text,
			[POST_FIELDS.POST_STATUS]: POST_STATUS.DRAFT, // Draft status
			[POST_FIELDS.MEDIA]: mediaArray,
			[POST_FIELDS.PLATFORM_CONFIGURATION]: platformConfiguration,
			[POST_FIELDS.PROFILE_GROUP]: postParams.profileGroupUuid,
		};

		// Add optional fields
		// Note: For draft status (2), we can include planned_publication_datetime
		// For ready status (4), it should be null
		if (postParams.plannedPublicationDatetime) {
			postBody[POST_FIELDS.PLANNED_PUBLICATION_DATETIME] = postParams.plannedPublicationDatetime;
		}
		if (postParams.videoThumbnailUuid) {
			postBody[POST_FIELDS.VIDEO_THUMBNAIL] = { [POST_FIELDS.UUID]: postParams.videoThumbnailUuid };
		}
		if (postParams.customMetadata) {
			postBody[POST_FIELDS.CUSTOM_METADATA] = postParams.customMetadata;
		}
		if (postParams.linkedinDocumentTitle && (postParams.platforms.includes(PLATFORMS.LINKEDIN_PERSONAL_ACCOUNT) || postParams.platforms.includes(PLATFORMS.LINKEDIN_BUSINESS_PAGE))) {
			postBody[POST_FIELDS.LINKEDIN_DOCUMENT_TITLE] = postParams.linkedinDocumentTitle;
		}

		// Step 3: Create the draft post
		const postResponse = await this.helpers.httpRequestWithAuthentication.call(
			this,
			CREDENTIAL_NAME,
			{
				method: 'POST',
				url: buildUrl(ENDPOINTS.POSTS),
				body: postBody,
				json: true,
			},
		) as IDataObject;

		const createdPostUuid = postResponse[POST_FIELDS.UUID] as string;

		// Step 4: Build approval body (parameters already fetched and validated at the top)
		const approvalBody: IDataObject = {
			[APPROVAL_FIELDS.MULTIPLATFORM_SOCIAL_MEDIA_POST]: createdPostUuid,
			[APPROVAL_FIELDS.APPROVAL_STEP_1_USERS]: step1UserObjects,
			[APPROVAL_FIELDS.APPROVAL_STEP_1_USERS_RULE]: step1Rule,
			[APPROVAL_FIELDS.STEP_MODE]: stepMode,
		};

		// Add step 2 parameters if multi-step mode (already fetched and validated at the top)
		if (stepMode === APPROVAL_STEP_MODE.MULTI_STEP) {
			approvalBody[APPROVAL_FIELDS.APPROVAL_STEP_2_USERS] = step2UserObjects;
			approvalBody[APPROVAL_FIELDS.APPROVAL_STEP_2_USERS_RULE] = step2Rule;
		}

		// Step 5: Create approval process
		const approvalResponse = await this.helpers.httpRequestWithAuthentication.call(
			this,
			CREDENTIAL_NAME,
			{
				method: 'POST',
				url: buildUrl(ENDPOINTS.APPROVAL_PROCESSES),
				body: approvalBody,
				json: true,
			},
		) as IDataObject;

		// Merge both responses (post data + approval process data)
		const mergedResponse = {
			...postResponse,
			...approvalResponse,
		};

		returnData.push(mergedResponse);

	return returnData;
}

export const createDraftAndSendApprovalDescription: INodeProperties[] = [
	{
		displayName: 'Profile Group UUID',
		name: 'profileGroupUuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['createDraftAndSendApproval'],
			},
		},
		default: '',
		description: 'UUID of the profile group to which the post belongs',
	},
	{
		displayName: 'Post Text',
		name: 'text',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['createDraftAndSendApproval'],
			},
		},
		typeOptions: {
			rows: 4,
		},
		default: '',
		description: 'The text content of your post (max 320,000 characters)',
	},
	{
		displayName: 'Platforms',
		name: 'platformConfiguration',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['createDraftAndSendApproval'],
			},
		},
		options: [...PLATFORM_OPTIONS],
		default: [],
		description: 'Select the platforms where you want to publish this post',
	},
	{
		displayName: 'Approval Mode',
		name: 'stepMode',
		type: 'options',
		required: true,
		default: APPROVAL_STEP_MODE.SINGLE_STEP,
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['createDraftAndSendApproval'],
			},
		},
		options: [
			{ name: 'Single Step', value: APPROVAL_STEP_MODE.SINGLE_STEP },
			{ name: 'Multi Step', value: APPROVAL_STEP_MODE.MULTI_STEP },
		],
		description: 'Choose between single step or multi-step approval process',
	},
	{
		displayName: 'Step 1 Approvers',
		name: 'approvalStep1Users',
		type: 'fixedCollection',
		required: true,
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['createDraftAndSendApproval'],
			},
		},
		default: {
			users: [
				{
					uuid: '',
				},
			],
		},
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				name: 'users',
				displayName: 'Users',
				values: [
					{
						displayName: 'User UUID',
						name: 'uuid',
						type: 'string',
						required: true,
						default: '',
						description: 'UUID of the user who can approve in step 1',
					},
				],
			},
		],
		description: 'User UUIDs who can approve in the first step. At least one user is required.',
	},
	{
		displayName: 'Step 1 Approval Rule',
		name: 'approvalStep1UsersRule',
		type: 'options',
		required: true,
		default: APPROVAL_RULE.ALL_USERS_MUST_APPROVE,
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['createDraftAndSendApproval'],
			},
		},
		options: [
			{ name: 'All Users Must Approve', value: APPROVAL_RULE.ALL_USERS_MUST_APPROVE },
			{ name: 'Any User Can Approve', value: APPROVAL_RULE.ANY_USER_CAN_APPROVE },
		],
		description: 'Specify whether all users or any single user needs to approve in step 1',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['createDraftAndSendApproval'],
			},
		},
		options: [
			{
				displayName: 'Custom Metadata',
				name: 'customMetadata',
				type: 'string',
				default: '',
				description: 'Custom metadata for the post (max 100 characters)',
			},
			{
				displayName: 'LinkedIn Document Title',
				name: 'linkedinDocumentTitle',
				type: 'string',
				default: '',
				description: 'Title for LinkedIn document posts (max 58 characters). Only used when LinkedIn is selected.',
			},
			{
				displayName: 'Media',
				name: 'mediaCollection',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'media',
						displayName: 'Media Items',
						values: [
							{
								displayName: 'Media UUID',
								name: 'uuid',
								type: 'string',
								default: '',
								description: 'UUID of the media file',
							},
						],
					},
				],
				description: 'Array of media UUIDs. Order determines publication order.',
			},
			{
				displayName: 'Planned Publication Date/Time',
				name: 'plannedPublicationDatetime',
				type: 'dateTime',
				default: '',
				description: 'Schedule when the post should be published (ISO 8601 format)',
			},
			{
				displayName: 'Step 2 Approval Rule',
				name: 'approvalStep2UsersRule',
				type: 'options',
				default: APPROVAL_RULE.ALL_USERS_MUST_APPROVE.toString(),
				displayOptions: {
					show: {
						'/stepMode': [APPROVAL_STEP_MODE.MULTI_STEP],
					},
				},
				options: [
					{ name: 'All Users Must Approve', value: APPROVAL_RULE.ALL_USERS_MUST_APPROVE },
					{ name: 'Any User Can Approve', value: APPROVAL_RULE.ANY_USER_CAN_APPROVE },
				],
				description: 'Specify whether all users or any single user needs to approve in step 2',
			},
			{
				displayName: 'Step 2 Approvers',
				name: 'approvalStep2Users',
				type: 'fixedCollection',
				default: {
					users: [
						{
							uuid: '',
						},
					],
				},
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						'/stepMode': [2],
					},
				},
				options: [
					{
						name: 'users',
						displayName: 'Users',
						values: [
							{
								displayName: 'User UUID',
								name: 'uuid',
								type: 'string',
								required: true,
								default: '',
								description: 'UUID of the user who can approve in step 2',
							},
						],
					},
				],
				description: 'User UUIDs for second approval step (required in multi-step mode)',
			},
			{
				displayName: 'Video Thumbnail UUID',
				name: 'videoThumbnailUuid',
				type: 'string',
				default: '',
				description: 'UUID of image to use as video thumbnail (must match video dimensions)',
			},
		],
	},
];
