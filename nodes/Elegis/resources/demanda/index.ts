import type { INodeProperties } from 'n8n-workflow';

export const demandaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['demanda'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a demanda',
				action: 'Create a demanda',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a demanda',
				action: 'Delete a demanda',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a demanda by ID',
				action: 'Get a demanda',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List demandas',
				action: 'Get many demandas',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a demanda',
				action: 'Update a demanda',
			},
		],
		default: 'getAll',
	},
];

export const demandaFields: INodeProperties[] = [
	{
		displayName: 'Demanda ID',
		name: 'demandaId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['demanda'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'ID of the demanda',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['demanda'],
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
				resource: ['demanda'],
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
				resource: ['demanda'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Cancelled', value: 'cancelado' },
					{ name: 'Completed', value: 'finalizado' },
					{ name: 'In Progress', value: 'em_andamento' },
					{ name: 'Open', value: 'aberto' },
				],
				default: 'aberto',
				description: 'Filter by status',
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
		],
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'json',
		required: true,
		default:
			'{\n  "cadastro_id": 0,\n  "descricao": "",\n  "assuntos": []\n}',
		displayOptions: {
			show: {
				resource: ['demanda'],
				operation: ['create'],
			},
		},
		description:
			'JSON body accepted by the Elegis API. Required: cadastro_id, descricao, assuntos (array of IDs). Optional: protocolo, data, autor, chave_de_acesso, valor, obs, prazo, prioridade_id, status_demanda, status, data_finalizado, aceite, reservado, assessor, solicitante. See https://elegis.com.br/docs',
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				resource: ['demanda'],
				operation: ['update'],
			},
		},
		description:
			'JSON body with fields to update (same fields as create). Only send fields you want to change.',
	},
];
