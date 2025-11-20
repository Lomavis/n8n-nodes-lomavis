import type { INodeProperties } from 'n8n-workflow';
import { postCreateDescription, executePostCreate } from './create';
import { createDraftAndSendApprovalDescription, executePostCreateDraftAndSendApproval } from './createDraftAndSendApproval';
import { postDeleteDescription, executePostDelete } from './delete';
import { postListByStatusDescription, executePostListByStatus } from './listByStatus';

export { executePostCreate, executePostCreateDraftAndSendApproval, executePostDelete, executePostListByStatus };

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
		],
		default: 'listByStatus',
	},
	...postCreateDescription,
	...createDraftAndSendApprovalDescription,
	...postDeleteDescription,
	...postListByStatusDescription,
];
