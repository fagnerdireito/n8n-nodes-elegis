import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function elegisApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('elegisApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${endpoint}`,
		qs,
		json: true,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'elegisApi',
			options,
		)) as IDataObject | IDataObject[];
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Parse a JSON parameter that may already be an object (n8n json type) or a string.
 */
export function parseJsonParameter(value: unknown, fieldName: string): IDataObject {
	if (value === undefined || value === null || value === '') {
		return {};
	}

	if (typeof value === 'object' && !Array.isArray(value)) {
		return value as IDataObject;
	}

	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value) as unknown;
			if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
				throw new Error(`${fieldName} must be a JSON object`);
			}
			return parsed as IDataObject;
		} catch (error) {
			if (error instanceof Error && error.message.includes('must be a JSON object')) {
				throw error;
			}
			throw new Error(`${fieldName} contains invalid JSON`);
		}
	}

	throw new Error(`${fieldName} must be a JSON object`);
}

export function mergeContext(
	clienteId: number,
	userId: number,
	data: IDataObject = {},
): IDataObject {
	return {
		...data,
		cliente_id: clienteId,
		user_id: userId,
	};
}
