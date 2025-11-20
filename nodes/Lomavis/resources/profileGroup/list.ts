import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { buildUrl, ENDPOINTS } from '../../constants/endpoints';
import { CREDENTIAL_NAME } from '../../constants/apiFields';

const showOnlyForProfileGroupList = {
	operation: ['list'],
	resource: ['profileGroup'],
};

export async function executeProfileGroupList(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const limit = this.getNodeParameter('limit', i, 25) as number;
	const responseData = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		CREDENTIAL_NAME,
		{
			method: 'GET',
			url: buildUrl(ENDPOINTS.PROFILE_GROUPS),
			qs: { limit },
		},
	)) as IDataObject;
	return Array.isArray(responseData) ? responseData : [responseData];
}

export const profileGroupListDescription: INodeProperties[] = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: showOnlyForProfileGroupList,
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
		},
		description: 'Max number of results to return',
	},
];
