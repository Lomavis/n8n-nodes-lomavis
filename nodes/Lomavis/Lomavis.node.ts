import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError, NodeApiError } from 'n8n-workflow';
import { profileGroupDescription } from './resources/profileGroup';
import { postDescription } from './resources/post';
import { mediaDescription } from './resources/media';
import { operationMap } from './operationConfig';
import { BASE_URL } from './constants/endpoints';

export class Lomavis implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Lomavis',
		name: 'lomavis',
		icon: 'file:../../icons/lomavis.svg',
		group: ['transform'],
		version: 2,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Lomavis API for social media management',
		defaults: {
			name: 'Lomavis',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'lomavisApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: BASE_URL,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Media',
						value: 'media',
					},
					{
						name: 'Post',
						value: 'post',
					},
					{
						name: 'Profile Group',
						value: 'profileGroup',
					},
				],
				default: 'profileGroup',
			},
			...profileGroupDescription,
			...postDescription,
			...mediaDescription,
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Get operation function from the map
		const operationKey = `${resource}_${operation}`;
		const operationFunction = operationMap[operationKey];

		if (!operationFunction) {
			throw new NodeOperationError(
				this.getNode(),
				`The operation '${operation}' is not supported for resource '${resource}'`,
			);
		}

		// Execute operation for each input item
		for (let i = 0; i < items.length; i++) {
			try {
				const responseData = await operationFunction.call(this, i);

				// Handle the response
				responseData.forEach((item) => {
					returnData.push({
						json: item,
						pairedItem: { item: i },
					});
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}

				// Use NodeApiError for API-related errors (has response property)
				if ((error as IDataObject).response) {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						itemIndex: i,
					});
				}

				// Use NodeOperationError for operational/validation errors
				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
