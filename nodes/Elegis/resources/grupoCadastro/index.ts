import type { INodeProperties } from 'n8n-workflow';

export const grupoCadastroOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['grupoCadastro'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List cadastros linked to a grupo',
				action: 'Get many cadastros in a grupo',
			},
			{
				name: 'Link',
				value: 'link',
				description: 'Link cadastros to a grupo without removing existing ones',
				action: 'Link cadastros to a grupo',
			},
			{
				name: 'Unlink',
				value: 'unlink',
				description: 'Remove a cadastro from a grupo',
				action: 'Unlink a cadastro from a grupo',
			},
		],
		default: 'link',
	},
];

export const grupoCadastroFields: INodeProperties[] = [
	{
		displayName: 'Grupo ID',
		name: 'grupoId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['grupoCadastro'],
			},
		},
		description: 'ID of the grupo',
	},
	{
		displayName: 'Cadastro ID',
		name: 'cadastroId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['grupoCadastro'],
				operation: ['unlink'],
			},
		},
		description: 'ID of the cadastro to unlink from the grupo',
	},
	{
		displayName: 'Cadastros IDs',
		name: 'cadastrosIds',
		type: 'json',
		required: true,
		default: '[]',
		displayOptions: {
			show: {
				resource: ['grupoCadastro'],
				operation: ['link'],
			},
		},
		description: 'JSON array of cadastro IDs to link, e.g. [1, 2, 3]',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['grupoCadastro'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['grupoCadastro'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['grupoCadastro'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
			},
			{
				displayName: 'Per Page',
				name: 'per_page',
				type: 'number',
				default: 15,
				description: 'Items per page (max 15)',
			},
		],
	},
];
