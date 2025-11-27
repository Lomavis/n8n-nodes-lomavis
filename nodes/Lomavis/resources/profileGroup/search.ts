import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { buildUrl, ENDPOINTS } from '../../constants/endpoints';
import { CREDENTIAL_NAME } from '../../constants/apiFields';

const showOnlyForProfileGroupSearch = {
	operation: ['search'],
	resource: ['profileGroup'],
};

export async function executeProfileGroupSearch(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const email = (options.email as string) || '';
	const name = (options.name as string) || '';
	const limit = (options.limit as number) || 25;

	const qs: IDataObject = {
		limit,
	};

	if (email) {
		qs.email = email;
	}

	if (name) {
		qs.name = name;
	}

	const url = buildUrl(ENDPOINTS.PROFILE_GROUPS);

	// Log request details
	this.logger.info('=== Profile Group Search Request ===');
	this.logger.info(`URL: ${url}`);
	this.logger.info(`Query String: ${JSON.stringify(qs, null, 2)}`);

	const responseData = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		CREDENTIAL_NAME,
		{
			method: 'GET',
			url,
			qs,
		},
	)) as IDataObject;

	// Log response details
	this.logger.info('=== Profile Group Search Response ===');
	this.logger.info(`Response: ${JSON.stringify(responseData, null, 2)}`);

	// Return the entire response object including pagination info
	return [responseData];
}

export const profileGroupSearchDescription: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForProfileGroupSearch,
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'Filter profile groups by email address',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter profile groups by name',
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
			},
		],
	},
];
