import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class LomavisApi implements ICredentialType {
	name = 'lomavisApi';

	displayName = 'Lomavis API';

	documentationUrl = 'https://app.lomavis.com/api/docs/';

	icon: Icon = 'file:../icons/lomavis.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The API key for your Lomavis account. You can find this in your Lomavis account settings under API Access.',
			placeholder: 'e.g., 1234567890abcdef1234567890abcdef',
		},
	];

	// This allows the credential to be used by other nodes
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Token {{$credentials.apiKey}}',
			},
		},
	};

	// Test the credentials to ensure they're valid
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.lomavis.com/api/v1',
			url: '/users/3c038f8a-50c8-4e60-93c0-877e29492a8f/',
			method: 'GET',
		},
	};
}
