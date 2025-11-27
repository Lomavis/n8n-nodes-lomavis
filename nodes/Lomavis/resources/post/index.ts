import type { INodeProperties } from 'n8n-workflow';
import { postCreateDescription, executePostCreate } from './create';
import { createDraftAndSendApprovalDescription, executePostCreateDraftAndSendApproval } from './createDraftAndSendApproval';
import { postDeleteDescription, executePostDelete } from './delete';
import { postListByStatusDescription, executePostListByStatus } from './listByStatus';
import { postSendApprovalDescription, executePostSendApproval } from './sendApproval';

export { executePostCreate, executePostCreateDraftAndSendApproval, executePostDelete, executePostListByStatus, executePostSendApproval };

const showOnlyForPosts = {
	resource: ['post'],
};

export const postDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForPosts,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a post',
				description: 'Create a new social media post',
			},
			{
				name: 'Create Draft and Send Approval',
				value: 'createDraftAndSendApproval',
				action: 'Create draft and send for approval',
				description: 'Create a draft post and immediately send it for approval',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a post',
				description: 'Delete a post by UUID',
			},
			{
				name: 'List by Status',
				value: 'listByStatus',
				action: 'List posts by status',
				description: 'Get posts filtered by status',
				routing: {
					request: {
						method: 'GET',
						url: '/multiplatformsocialmediaposts/',
					},
				},
			},
			{
				name: 'Send Approval',
				value: 'sendApproval',
				action: 'Send post for approval',
				description: 'Send an existing post for approval',
			},
		],
		default: 'listByStatus',
	},
	...postCreateDescription,
	...createDraftAndSendApprovalDescription,
	...postDeleteDescription,
	...postListByStatusDescription,
	...postSendApprovalDescription,
];
