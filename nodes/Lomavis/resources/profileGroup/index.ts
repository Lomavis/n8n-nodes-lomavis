import type { INodeProperties } from 'n8n-workflow';
import { profileGroupListDescription, executeProfileGroupList } from './list';

export { executeProfileGroupList };

const showOnlyForProfileGroups = {
	resource: ['profileGroup'],
};

export const profileGroupDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForProfileGroups,
		},
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'List all profile groups',
				description: 'Get all profile groups',
				routing: {
					request: {
						method: 'GET',
						url: '/profile_groups/',
					},
				},
			},
		],
		default: 'list',
	},
	...profileGroupListDescription,
];
