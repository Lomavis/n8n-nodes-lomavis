import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { buildUrl, ENDPOINTS } from '../../constants/endpoints';
import { POST_STATUS_STRING } from '../../constants/postStatuses';
import { POST_FIELDS, CREDENTIAL_NAME } from '../../constants/apiFields';

const showOnlyForPostListByStatus = {
	operation: ['listByStatus'],
	resource: ['post'],
};

export async function executePostListByStatus(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const profileGroupUuid = this.getNodeParameter('profileGroupUuid', i) as string;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const postStatus = (options.postStatus as string[]) || [];
	const limit = (options.limit as number) || 25;

	const qs: IDataObject = {
		[POST_FIELDS.PROFILE_GROUP_UUID]: profileGroupUuid,
		limit,
	};

	if (postStatus.length > 0) {
		qs[POST_FIELDS.POST_STATUS] = postStatus.join(',');
	}

	const responseData = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		CREDENTIAL_NAME,
		{
			method: 'GET',
			url: buildUrl(ENDPOINTS.POSTS),
			qs,
		},
	)) as IDataObject[];
	return Array.isArray(responseData) ? responseData : [responseData];
}

export const postListByStatusDescription: INodeProperties[] = [
	{
		displayName: 'Profile Group UUID',
		name: 'profileGroupUuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForPostListByStatus,
		},
		default: '',
		description: 'The UUID of the profile group (location) to filter posts',
		routing: {
			send: {
				type: 'query',
				property: POST_FIELDS.PROFILE_GROUP_UUID,
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForPostListByStatus,
		},
		options: [
			{
				displayName: 'Post Status',
				name: 'postStatus',
				type: 'multiOptions',
				options: [
					{
						name: 'Proposed by External User',
						value: POST_STATUS_STRING.PROPOSED_BY_EXTERNAL_USER,
					},
					{
						name: 'Draft',
						value: POST_STATUS_STRING.DRAFT,
					},
					{
						name: 'Waiting for Approval',
						value: POST_STATUS_STRING.WAITING_FOR_APPROVAL,
					},
					{
						name: 'Ready',
						value: POST_STATUS_STRING.READY,
					},
				],
				default: [],
				description: 'Filter by post status. You can select multiple statuses.',
				routing: {
					send: {
						type: 'query',
						property: POST_FIELDS.POST_STATUS,
						value: '={{$value.join(",")}}',
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 50,
				description: 'Max number of results to return',
				routing: {
					send: {
						type: 'query',
						property: 'limit',
					},
				},
			},
		],
	},
];
