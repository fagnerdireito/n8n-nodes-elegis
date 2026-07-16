import type { INodeProperties } from 'n8n-workflow';

export const cadastroOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['cadastro'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a cadastro',
				action: 'Create a cadastro',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a cadastro',
				action: 'Delete a cadastro',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a cadastro by ID',
				action: 'Get a cadastro',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List cadastros',
				action: 'Get many cadastros',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a cadastro',
				action: 'Update a cadastro',
			},
		],
		default: 'getAll',
	},
];

export const cadastroFields: INodeProperties[] = [
	{
		displayName: 'Cadastro ID',
		name: 'cadastroId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['cadastro'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'ID of the cadastro',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['cadastro'],
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
				resource: ['cadastro'],
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
				resource: ['cadastro'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Busca',
				name: 'busca',
				type: 'string',
				default: '',
				description: 'Search by name',
			},
			{
				displayName: 'Grupo ID',
				name: 'grupo_id',
				type: 'number',
				default: 0,
				description: 'Filter by group ID',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number (when not returning all)',
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
		default: '{\n  "nome": ""\n}',
		displayOptions: {
			show: {
				resource: ['cadastro'],
				operation: ['create'],
			},
		},
		description:
			'JSON body accepted by the Elegis API. Required: nome. Optional: email, celular, telefone, cpfcnpj, data_nascimento, sexo, estado_civil, profissao, endereco, numero, complemento, bairro, cidade, uf, cep, obs, is_private, grupos_ids, indicadores_ids. See https://elegis.com.br/docs',
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				resource: ['cadastro'],
				operation: ['update'],
			},
		},
		description:
			'JSON body with fields to update (same fields as create, plus remover_foto). Only send fields you want to change.',
	},
];
