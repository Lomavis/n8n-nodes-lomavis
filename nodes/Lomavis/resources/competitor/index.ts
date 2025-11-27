import type { INodeProperties } from 'n8n-workflow';
import { competitorListDescription, executeCompetitorList } from './list';

// Export execute function for operation config
export { executeCompetitorList };

export const competitorOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['competitor'],
			},
		},
		options: [
			{
				name: 'List',
				value: 'list',
				description: 'Get all competitors for a profile group',
				action: 'List competitors',
			},
		],
		default: 'list',
	},
];

export const competitorDescription: INodeProperties[] = [
	...competitorOperations,
	...competitorListDescription,
];
