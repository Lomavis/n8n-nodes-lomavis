import { config } from '@n8n/node-cli/eslint';

export default [
	...config,
	{
		rules: {
			'n8n-nodes-base/node-param-default-missing': 'off',
		},
	},
];
