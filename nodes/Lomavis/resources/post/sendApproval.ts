import type {
	IExecuteFunctions,
	IDataObject,
	INodeProperties,
} from 'n8n-workflow';
import { buildUrl, ENDPOINTS } from '../../constants/endpoints';
import { APPROVAL_STEP_MODE, APPROVAL_RULE } from '../../constants/postStatuses';
import { APPROVAL_FIELDS, CREDENTIAL_NAME } from '../../constants/apiFields';
import { APPROVAL_PARAMS } from '../../constants/nodeParameters';
import { extractApprovalUsers, type ApprovalUser } from '../../helpers/requestBuilders';

/**
 * Sends an existing post for approval
 * This creates an approval process for a post that already exists
 */
export async function executePostSendApproval(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	// Get post UUID
	const postUuid = this.getNodeParameter('postUuid', i) as string;

	// Get approval parameters
	const stepMode = this.getNodeParameter(APPROVAL_PARAMS.STEP_MODE, i) as number;
	const step1UsersCollection = this.getNodeParameter(APPROVAL_PARAMS.APPROVAL_STEP_1_USERS, i, {}) as IDataObject;
	const step1Rule = this.getNodeParameter(APPROVAL_PARAMS.APPROVAL_STEP_1_USERS_RULE, i) as number;

	// Process step 1 users using helper
	const step1UserObjects = extractApprovalUsers(step1UsersCollection);

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
	}

	// Build approval body
	const approvalBody: IDataObject = {
		[APPROVAL_FIELDS.MULTIPLATFORM_SOCIAL_MEDIA_POST]: postUuid,
		[APPROVAL_FIELDS.APPROVAL_STEP_1_USERS]: step1UserObjects,
		[APPROVAL_FIELDS.APPROVAL_STEP_1_USERS_RULE]: step1Rule,
		[APPROVAL_FIELDS.STEP_MODE]: stepMode,
	};

	// Add step 2 parameters if multi-step mode
	if (stepMode === APPROVAL_STEP_MODE.MULTI_STEP) {
		approvalBody[APPROVAL_FIELDS.APPROVAL_STEP_2_USERS] = step2UserObjects;
		approvalBody[APPROVAL_FIELDS.APPROVAL_STEP_2_USERS_RULE] = step2Rule;
	}

	const url = buildUrl(ENDPOINTS.APPROVAL_PROCESSES);

	// Log request details
	this.logger.info('=== Send Approval Request ===');
	this.logger.info(`URL: ${url}`);
	this.logger.info(`Body: ${JSON.stringify(approvalBody, null, 2)}`);

	// Create approval process
	const approvalResponse = await this.helpers.httpRequestWithAuthentication.call(
		this,
		CREDENTIAL_NAME,
		{
			method: 'POST',
			url,
			body: approvalBody,
			json: true,
		},
	) as IDataObject;

	// Log response details
	this.logger.info('=== Send Approval Response ===');
	this.logger.info(`Response: ${JSON.stringify(approvalResponse, null, 2)}`);

	return [approvalResponse];
}

export const postSendApprovalDescription: INodeProperties[] = [
	{
		displayName: 'Post UUID',
		name: 'postUuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['sendApproval'],
			},
		},
		default: '',
		description: 'UUID of the existing post to send for approval',
	},
	{
		displayName: 'Approval Mode',
		name: 'stepMode',
		type: 'options',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['sendApproval'],
			},
		},
		options: [
			{ name: 'Single Step', value: APPROVAL_STEP_MODE.SINGLE_STEP },
			{ name: 'Multi Step', value: APPROVAL_STEP_MODE.MULTI_STEP },
		],
		default: APPROVAL_STEP_MODE.SINGLE_STEP,
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
				operation: ['sendApproval'],
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
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['sendApproval'],
			},
		},
		options: [
			{ name: 'All Users Must Approve', value: APPROVAL_RULE.ALL_USERS_MUST_APPROVE },
			{ name: 'Any User Can Approve', value: APPROVAL_RULE.ANY_USER_CAN_APPROVE },
		],
		default: APPROVAL_RULE.ALL_USERS_MUST_APPROVE,
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
				operation: ['sendApproval'],
			},
		},
		options: [
			{
				displayName: 'Step 2 Approval Rule',
				name: 'approvalStep2UsersRule',
				type: 'options',
				default: APPROVAL_RULE.ALL_USERS_MUST_APPROVE.toString(),
				displayOptions: {
					show: {
						'/stepMode': [APPROVAL_STEP_MODE.MULTI_STEP.toString()],
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
						'/stepMode': [APPROVAL_STEP_MODE.MULTI_STEP.toString()],
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
		],
	},
];
