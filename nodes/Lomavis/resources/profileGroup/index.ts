import type { INodeProperties } from 'n8n-workflow';
import { profileGroupListDescription, executeProfileGroupList } from './list';
import { profileGroupSearchDescription, executeProfileGroupSearch } from './search';

export { executeProfileGroupList, executeProfileGroupSearch };

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
			{
				name: 'Search',
				value: 'search',
				action: 'Search profile groups',
				description: 'Search profile groups by email or name',
			},
		],
		default: 'list',
	},
	...profileGroupListDescription,
	...profileGroupSearchDescription,
];
