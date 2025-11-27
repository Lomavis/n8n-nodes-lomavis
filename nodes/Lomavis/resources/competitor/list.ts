import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { buildUrl, ENDPOINTS } from '../../constants/endpoints';
import { CREDENTIAL_NAME } from '../../constants/apiFields';

const showOnlyForCompetitorList = {
	operation: ['list'],
	resource: ['competitor'],
};

export async function executeCompetitorList(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const profileGroupUuid = this.getNodeParameter('profileGroupUuid', i) as string;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const limit = (options.limit as number) || 50;
	const offset = (options.offset as number) || 0;

	const qs: IDataObject = {
		profile_group_uuid: profileGroupUuid,
		limit,
		offset,
	};

	const url = buildUrl(ENDPOINTS.COMPETITORS);

	// Log request details
	this.logger.info('=== Competitor List Request ===');
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
	this.logger.info('=== Competitor List Response ===');
	this.logger.info(`Response: ${JSON.stringify(responseData, null, 2)}`);
	this.logger.info(`Response Type: ${typeof responseData}`);
	this.logger.info(`Has Results: ${'results' in responseData}`);
	if (responseData.results && Array.isArray(responseData.results)) {
		this.logger.info(`Result Count: ${responseData.results.length}`);
	}

	// Return the entire response object including pagination info (count, next, previous, results)
	return [responseData];
}

export const competitorListDescription: INodeProperties[] = [
	{
		displayName: 'Profile Group UUID',
		name: 'profileGroupUuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForCompetitorList,
		},
		default: '',
		description: 'The UUID of the profile group to list competitors for',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForCompetitorList,
		},
		options: [
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
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Number of results to skip (for pagination)',
			},
		],
	},
];
