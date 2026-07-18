import type { INodeProperties } from 'n8n-workflow';

export const grupoOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['grupo'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a grupo',
				action: 'Create a grupo',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a grupo',
				action: 'Delete a grupo',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a grupo by ID',
				action: 'Get a grupo',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List grupos',
				action: 'Get many grupos',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a grupo',
				action: 'Update a grupo',
			},
		],
		default: 'getAll',
	},
];

export const grupoFields: INodeProperties[] = [
	{
		displayName: 'Grupo ID',
		name: 'grupoId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['grupo'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'ID of the grupo',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['grupo'],
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
				resource: ['grupo'],
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
				resource: ['grupo'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Order',
				name: 'ordem',
				type: 'options',
				options: [
					{ name: 'ASC', value: 'asc' },
					{ name: 'DESC', value: 'desc' },
				],
				default: 'desc',
			},
			{
				displayName: 'Order By',
				name: 'ordenar_por',
				type: 'options',
				options: [
					{ name: 'Cadastros Count', value: 'cadastros_count' },
					{ name: 'Created At', value: 'created_at' },
					{ name: 'Form Active', value: 'form_active' },
					{ name: 'ID', value: 'id' },
					{ name: 'Name', value: 'nome' },
					{ name: 'Slug', value: 'slug' },
					{ name: 'Updated At', value: 'updated_at' },
				],
				default: 'id',
			},
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
			{
				displayName: 'Search',
				name: 'busca',
				type: 'string',
				default: '',
				description: 'Search by name',
			},
		],
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'json',
		required: true,
		default: '{\n  "nome": ""\n}',
		displayOptions: {
			show: {
				resource: ['grupo'],
				operation: ['create'],
			},
		},
		description:
			'JSON body accepted by the Elegis API. Required: nome. Optional: owner_id, form_template_id, form_active. See https://elegis.com.br/docs',
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				resource: ['grupo'],
				operation: ['update'],
			},
		},
		description: 'JSON body with fields to update: nome, owner_id, form_template_id, form_active',
	},
];
