import type { INodeProperties } from 'n8n-workflow';
import { mediaUploadDescription, executeMediaUpload } from './upload';

export { executeMediaUpload };

const showOnlyForMedia = {
	resource: ['media'],
};

export const mediaDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForMedia,
		},
		options: [
			{
				name: 'Upload',
				value: 'upload',
				action: 'Upload media file',
				description: 'Upload a media file to Lomavis (complete 3-step process)',
			},
		],
		default: 'upload',
	},
	...mediaUploadDescription,
];
