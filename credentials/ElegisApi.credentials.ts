import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class ElegisApi implements ICredentialType {
	name = 'elegisApi';

	displayName = 'Elegis API';

	documentationUrl = 'https://elegis.com.br/docs';

	icon: Icon = 'file:../nodes/Elegis/elegis.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Elegis API access token (Sanctum). Obtain via POST /api/login or from your Elegis account.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://elegis.com.br/api',
			required: true,
			description: 'Elegis API base URL (production default: https://elegis.com.br/api)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
				Accept: 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/user',
			method: 'GET',
		},
	};
}
