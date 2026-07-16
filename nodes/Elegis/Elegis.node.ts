import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { elegisApiRequest, mergeContext, parseJsonParameter } from './GenericFunctions';
import {
	cadastroFields,
	cadastroOperations,
	demandaFields,
	demandaOperations,
	grupoCadastroFields,
	grupoCadastroOperations,
	grupoFields,
	grupoOperations,
} from './resources';

function extractList(response: IDataObject | IDataObject[]): IDataObject[] {
	if (Array.isArray(response)) {
		return response;
	}
	if (Array.isArray(response.data)) {
		return response.data as IDataObject[];
	}
	return [response];
}

async function fetchAllPages(
	this: IExecuteFunctions,
	endpoint: string,
	baseQs: IDataObject,
	limit?: number,
): Promise<IDataObject[]> {
	const results: IDataObject[] = [];
	let page = 1;
	const perPage = 15;

	while (true) {
		const response = await elegisApiRequest.call(this, 'GET', endpoint, {}, {
			...baseQs,
			page,
			per_page: perPage,
		});

		const items = extractList(response);
		results.push(...items);

		if (limit !== undefined && results.length >= limit) {
			return results.slice(0, limit);
		}

		const meta = (response as IDataObject).meta as IDataObject | undefined;
		const lastPage =
			(meta?.last_page as number | undefined) ??
			((response as IDataObject).last_page as number | undefined);

		if (!lastPage || page >= lastPage || items.length === 0) {
			break;
		}
		page += 1;
	}

	return results;
}

export class Elegis implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Elegis',
		name: 'elegis',
		icon: 'file:elegis.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Elegis API (Cadastro, Grupo, Demanda)',
		defaults: {
			name: 'Elegis',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'elegisApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Cadastro',
						value: 'cadastro',
					},
					{
						name: 'Demanda',
						value: 'demanda',
					},
					{
						name: 'Grupo',
						value: 'grupo',
					},
					{
						name: 'Grupo Cadastro',
						value: 'grupoCadastro',
					},
				],
				default: 'cadastro',
			},
			{
				displayName: 'Cliente ID',
				name: 'clienteId',
				type: 'number',
				required: true,
				default: 0,
				description: 'Team/cliente ID (cliente_id) required by every Elegis app API call',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'number',
				required: true,
				default: 0,
				description: 'User ID (user_id) required by every Elegis app API call',
			},
			...cadastroOperations,
			...cadastroFields,
			...grupoOperations,
			...grupoFields,
			...demandaOperations,
			...demandaFields,
			...grupoCadastroOperations,
			...grupoCadastroFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const clienteId = this.getNodeParameter('clienteId', i) as number;
				const userId = this.getNodeParameter('userId', i) as number;
				const context = { cliente_id: clienteId, user_id: userId };

				let responseData: IDataObject | IDataObject[] = {};

				if (resource === 'cadastro') {
					responseData = await executeCadastro.call(this, operation, context, i);
				} else if (resource === 'grupo') {
					responseData = await executeGrupo.call(this, operation, context, i);
				} else if (resource === 'demanda') {
					responseData = await executeDemanda.call(this, operation, context, i);
				} else if (resource === 'grupoCadastro') {
					responseData = await executeGrupoCadastro.call(this, operation, context, i);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, {
						itemIndex: i,
					});
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

async function executeCadastro(
	this: IExecuteFunctions,
	operation: string,
	context: IDataObject,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
		const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
		const qs: IDataObject = { ...context, ...filters };
		if (qs.grupo_id === 0) {
			delete qs.grupo_id;
		}

		if (returnAll) {
			return await fetchAllPages.call(this, '/app/api/cadastros', qs);
		}

		const limit = this.getNodeParameter('limit', itemIndex, 15) as number;
		qs.per_page = Math.min((qs.per_page as number) || limit, 15);
		const response = await elegisApiRequest.call(this, 'GET', '/app/api/cadastros', {}, qs);
		return extractList(response).slice(0, limit);
	}

	if (operation === 'get') {
		const cadastroId = this.getNodeParameter('cadastroId', itemIndex) as number;
		return (await elegisApiRequest.call(
			this,
			'GET',
			`/app/api/cadastros/${cadastroId}`,
			{},
			context,
		)) as IDataObject;
	}

	if (operation === 'create') {
		const data = parseJsonParameter(this.getNodeParameter('data', itemIndex), 'Data');
		const body = mergeContext(context.cliente_id as number, context.user_id as number, data);
		return (await elegisApiRequest.call(
			this,
			'POST',
			'/app/api/cadastros',
			body,
		)) as IDataObject;
	}

	if (operation === 'update') {
		const cadastroId = this.getNodeParameter('cadastroId', itemIndex) as number;
		const data = parseJsonParameter(this.getNodeParameter('data', itemIndex), 'Data');
		const body = mergeContext(context.cliente_id as number, context.user_id as number, data);
		return (await elegisApiRequest.call(
			this,
			'PUT',
			`/app/api/cadastros/${cadastroId}`,
			body,
		)) as IDataObject;
	}

	if (operation === 'delete') {
		const cadastroId = this.getNodeParameter('cadastroId', itemIndex) as number;
		return (await elegisApiRequest.call(
			this,
			'DELETE',
			`/app/api/cadastros/${cadastroId}`,
			{},
			context,
		)) as IDataObject;
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex });
}

async function executeGrupo(
	this: IExecuteFunctions,
	operation: string,
	context: IDataObject,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
		const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
		const qs: IDataObject = { ...context, ...filters };

		if (returnAll) {
			return await fetchAllPages.call(this, '/app/api/grupos', qs);
		}

		const limit = this.getNodeParameter('limit', itemIndex, 15) as number;
		qs.per_page = Math.min((qs.per_page as number) || limit, 15);
		const response = await elegisApiRequest.call(this, 'GET', '/app/api/grupos', {}, qs);
		return extractList(response).slice(0, limit);
	}

	if (operation === 'get') {
		const grupoId = this.getNodeParameter('grupoId', itemIndex) as number;
		return (await elegisApiRequest.call(
			this,
			'GET',
			`/app/api/grupos/${grupoId}`,
			{},
			context,
		)) as IDataObject;
	}

	if (operation === 'create') {
		const data = parseJsonParameter(this.getNodeParameter('data', itemIndex), 'Data');
		const body = mergeContext(context.cliente_id as number, context.user_id as number, data);
		return (await elegisApiRequest.call(this, 'POST', '/app/api/grupos', body)) as IDataObject;
	}

	if (operation === 'update') {
		const grupoId = this.getNodeParameter('grupoId', itemIndex) as number;
		const data = parseJsonParameter(this.getNodeParameter('data', itemIndex), 'Data');
		const body = mergeContext(context.cliente_id as number, context.user_id as number, data);
		return (await elegisApiRequest.call(
			this,
			'PUT',
			`/app/api/grupos/${grupoId}`,
			body,
		)) as IDataObject;
	}

	if (operation === 'delete') {
		const grupoId = this.getNodeParameter('grupoId', itemIndex) as number;
		return (await elegisApiRequest.call(
			this,
			'DELETE',
			`/app/api/grupos/${grupoId}`,
			{},
			context,
		)) as IDataObject;
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex });
}

async function executeDemanda(
	this: IExecuteFunctions,
	operation: string,
	context: IDataObject,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
		const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
		const qs: IDataObject = { ...context, ...filters };

		if (returnAll) {
			return await fetchAllPages.call(this, '/app/api/demandas', qs);
		}

		const limit = this.getNodeParameter('limit', itemIndex, 15) as number;
		qs.per_page = Math.min((qs.per_page as number) || limit, 15);
		const response = await elegisApiRequest.call(this, 'GET', '/app/api/demandas', {}, qs);
		return extractList(response).slice(0, limit);
	}

	if (operation === 'get') {
		const demandaId = this.getNodeParameter('demandaId', itemIndex) as number;
		return (await elegisApiRequest.call(
			this,
			'GET',
			`/app/api/demandas/${demandaId}`,
			{},
			context,
		)) as IDataObject;
	}

	if (operation === 'create') {
		const data = parseJsonParameter(this.getNodeParameter('data', itemIndex), 'Data');
		const body = mergeContext(context.cliente_id as number, context.user_id as number, data);
		return (await elegisApiRequest.call(
			this,
			'POST',
			'/app/api/demandas',
			body,
		)) as IDataObject;
	}

	if (operation === 'update') {
		const demandaId = this.getNodeParameter('demandaId', itemIndex) as number;
		const data = parseJsonParameter(this.getNodeParameter('data', itemIndex), 'Data');
		const body = mergeContext(context.cliente_id as number, context.user_id as number, data);
		return (await elegisApiRequest.call(
			this,
			'PUT',
			`/app/api/demandas/${demandaId}`,
			body,
		)) as IDataObject;
	}

	if (operation === 'delete') {
		const demandaId = this.getNodeParameter('demandaId', itemIndex) as number;
		return (await elegisApiRequest.call(
			this,
			'DELETE',
			`/app/api/demandas/${demandaId}`,
			{},
			context,
		)) as IDataObject;
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex });
}

async function executeGrupoCadastro(
	this: IExecuteFunctions,
	operation: string,
	context: IDataObject,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const grupoId = this.getNodeParameter('grupoId', itemIndex) as number;

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
		const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
		const qs: IDataObject = { ...context, ...filters };
		const endpoint = `/app/api/grupos/${grupoId}/cadastros`;

		if (returnAll) {
			return await fetchAllPages.call(this, endpoint, qs);
		}

		const limit = this.getNodeParameter('limit', itemIndex, 15) as number;
		qs.per_page = Math.min((qs.per_page as number) || limit, 15);
		const response = await elegisApiRequest.call(this, 'GET', endpoint, {}, qs);
		return extractList(response).slice(0, limit);
	}

	if (operation === 'link') {
		const rawIds = this.getNodeParameter('cadastrosIds', itemIndex);
		let cadastrosIds: number[];

		if (typeof rawIds === 'string') {
			const parsed = JSON.parse(rawIds) as unknown;
			if (!Array.isArray(parsed)) {
				throw new NodeOperationError(this.getNode(), 'Cadastros IDs must be a JSON array', {
					itemIndex,
				});
			}
			cadastrosIds = parsed.map((id) => Number(id));
		} else if (Array.isArray(rawIds)) {
			cadastrosIds = rawIds.map((id) => Number(id));
		} else {
			throw new NodeOperationError(this.getNode(), 'Cadastros IDs must be a JSON array', {
				itemIndex,
			});
		}

		const body = mergeContext(context.cliente_id as number, context.user_id as number, {
			cadastros_ids: cadastrosIds,
		});

		return (await elegisApiRequest.call(
			this,
			'POST',
			`/app/api/grupos/${grupoId}/cadastros`,
			body,
		)) as IDataObject;
	}

	if (operation === 'unlink') {
		const cadastroId = this.getNodeParameter('cadastroId', itemIndex) as number;
		return (await elegisApiRequest.call(
			this,
			'DELETE',
			`/app/api/grupos/${grupoId}/cadastros/${cadastroId}`,
			{},
			context,
		)) as IDataObject;
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex });
}
